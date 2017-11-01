#!/usr/bin/env python
import curses
import json
import time

import arrow
import pyrebase

SHOULD_FETCH_RUNNING = True
SHOULD_FETCH_FINSHED = True


def running_stream_handler(message):
    global SHOULD_FETCH_RUNNING
    SHOULD_FETCH_RUNNING = True


def finished_stream_handler(message):
    global SHOULD_FETCH_FINSHED
    SHOULD_FETCH_FINSHED = True


def get_running_jobs(window):
    global SHOULD_FETCH_RUNNING
    if not SHOULD_FETCH_RUNNING:
        return
    window.erase()
    SHOULD_FETCH_RUNNING = False
    window.addstr(0, 1, '%-32s  %-8s' % (
        'BQPS Running Jobs - Last Update:', time.ctime()))
    window.chgat(0, 1, 133, curses.A_STANDOUT | curses.color_pair(2))
    window.addstr(1, 1, '%-30s %-20s %-16s %-24s %-24s %-14s' % (
        'Id', 'User', 'IP', 'Start Time', ' ', ' '),
                  curses.A_BOLD | curses.A_REVERSE)
    running_jobs = db.child("running-jobs").get()
    cnt = 2
    if running_jobs.pyres is not None:
        for job in running_jobs.each():
            window.addstr(cnt, 1, '%-30s %-20s %-16s %-24s' % (
                job.val()['protoPayload']['serviceData']['jobInsertResponse'][
                    'resource']['jobName']['jobId'],
                job.val()['protoPayload']['authenticationInfo'][
                    'principalEmail'],
                job.val()['protoPayload']['requestMetadata']['callerIp'],
                arrow.get(job.val()['protoPayload']['serviceData'][
                    'jobInsertResponse'][
                        'resource']['jobStatistics'][
                            'startTime']).format('YYYY-MM-DD HH:mm:ss')))
            window.chgat(cnt, 1, 133, curses.A_BOLD | curses.color_pair(2))
            cnt += 1
    window.addstr(cnt, 0, ' ' * (curses.COLS - 1))
    window.move(curses.LINES - 2, curses.COLS - 2)


def get_finished_jobs(window):
    global SHOULD_FETCH_FINSHED
    if not SHOULD_FETCH_FINSHED:
        return
    window.erase()

    SHOULD_FETCH_FINSHED = False
    cnt = 2
    window.addstr(0, 1, '%-32s  %-8s' % (
        'BQPS Finished Jobs - Last Update:', time.ctime()))
    window.chgat(0, 1, 133, curses.A_BOLD | curses.color_pair(3))
    window.addstr(1, 1, '%-30s %-20s %-16s %-24s %-24s %-12s' % (
        'Id', 'User', 'IP', 'Start Time', 'End Time', "Execution Time"),
                  curses.A_BOLD | curses.A_REVERSE)
    finished_jobs = db.child("finished-jobs").order_by_key().limit_to_last(
        100).get()
    if finished_jobs.pyres is not None:
        flen = len(finished_jobs.pyres)
        cnt = cnt + flen
        for job in finished_jobs.each():
            start = arrow.get(
                job.val()['protoPayload']['serviceData']['jobCompletedEvent'][
                    'job']['jobStatistics']['startTime'])
            end = arrow.get(
                job.val()['protoPayload']['serviceData']['jobCompletedEvent'][
                    'job']['jobStatistics']['endTime'])
            delta = end - start
            window.addstr(cnt, 1, '%-30s %-20s %-16s %-24s %-24s %-12s' % (
                job.val()['protoPayload']['serviceData']['jobCompletedEvent'][
                    'job']['jobName']['jobId'],
                job.val()['protoPayload']['authenticationInfo'][
                    'principalEmail'],
                job.val()['protoPayload']['requestMetadata']['callerIp'],
                start.format('YYYY-MM-DD HH:mm:ss'),
                end.format('YYYY-MM-DD HH:mm:ss'),
                delta,

            )
                         )
            window.chgat(cnt, 1, 133, curses.A_BOLD | curses.color_pair(3))
            cnt -= 1
    window.addstr(cnt, 0, ' ' * (curses.COLS - 1))


def start_curses(stdscr):
    curses.use_default_colors()

    curses.init_pair(1, curses.COLOR_RED, curses.COLOR_BLACK)
    curses.init_pair(2, curses.COLOR_GREEN, curses.COLOR_BLACK)
    curses.init_pair(3, curses.COLOR_CYAN, curses.COLOR_BLACK)
    stdscr.addstr(curses.LINES - 1, 0, "Press 'Q' to quit")
    # Change the  Q to Red
    stdscr.chgat(curses.LINES - 1, 7, 1, curses.A_BOLD | curses.color_pair(1))
    running_window = curses.newpad(1000, curses.COLS)
    finished_window = curses.newpad(1000, curses.COLS)
    while True:
        get_running_jobs(running_window)
        get_finished_jobs(finished_window)
        stdscr.noutrefresh()
        running_window.noutrefresh(0, 0, 0, 0, int((curses.LINES - 8) / 2),
                                   curses.COLS)
        finished_window.noutrefresh(0, 0, int((curses.LINES - 8) / 2), 0,
                                    curses.LINES - 2, curses.COLS)
        curses.doupdate()
        running_window.nodelay(1)
        input_cmd = running_window.getch()
        if input_cmd == ord('q'):
            curses.beep()
            running_stream.close()
            finished_stream.close()
            break


if __name__ == '__main__':
    with open('config.json') as data_file:
        config = json.load(data_file)
    firebase = pyrebase.initialize_app(config)
    auth = firebase.auth()
    db = firebase.database()
    running_stream = db.child("running-jobs").stream(running_stream_handler)
    finished_stream = db.child("running-jobs").stream(finished_stream_handler)
    curses.wrapper(start_curses)
