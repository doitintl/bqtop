#!/usr/bin/env python
"""bqtop.py - Display BigQuery jobs in top style."""
import curses
import json
import time

import arrow
import pyrebase

SHOULD_FETCH_RUNNING = True
SHOULD_FETCH_FINISHED = True


def running_stream_handler(message):
    """
    Call back on new running jobs.

    :param message:
    """
    global SHOULD_FETCH_RUNNING
    SHOULD_FETCH_RUNNING = True


def finished_stream_handler(message):
    """
    Call back on finished jobs.

    :param message:
    """
    global SHOULD_FETCH_FINISHED
    SHOULD_FETCH_FINISHED = True


def get_running_jobs(window):
    """
    Get all running jobs and add the to the window.

    :param window:
    :return:
    """
    global SHOULD_FETCH_RUNNING
    if not SHOULD_FETCH_RUNNING:
        return
    maxy, maxx = window.getmaxyx()
    window.erase()
    SHOULD_FETCH_RUNNING = False
    window.addstr(0, 1, '%-32s  %-8s' % (
        'BQTop Running Jobs - Last Update:', time.ctime()))
    window.addstr(1, 1, '%-60s %-30s %-16s %-24s %-24s %-14s' % (
        'Id', 'User', 'IP', 'Start Time', ' ', '  '),
                  curses.A_BOLD | curses.A_REVERSE)
    running_jobs = db.child("running-jobs").get()
    counter = 2
    if running_jobs.pyres is not None:
        for job in running_jobs.each():
            data = job.val()
            window.addstr(counter, 1, '%-60s %-30s %-16s %-24s' % (
                data['protoPayload']['serviceData']['jobInsertResponse'][
                    'resource']['jobName']['jobId'][-60:],
                data['protoPayload']['authenticationInfo'][
                    'principalEmail'].split("@")[0],
                data['protoPayload']['requestMetadata']['callerIp'],
                arrow.get(data['protoPayload']['serviceData'][
                    'jobInsertResponse'][
                        'resource']['jobStatistics'][
                            'startTime']).format('YYYY-MM-DD HH:mm:ss')))
            counter += 1
    window.addstr(counter, 0, ' ' * (maxx- 1))
    window.move(maxy - 2, maxx - 2)


def get_finished_jobs(window):
    """
    Get all done jobs and add the to the window.

    :param window:
    :return:
    """
    global SHOULD_FETCH_FINISHED
    if not SHOULD_FETCH_FINISHED:
        return
    SHOULD_FETCH_FINISHED = False
    maxy, maxx = window.getmaxyx()
    window.erase()
    window.addstr(0, 1, '%-32s  %-8s' % (
        'BQTop Finished Jobs - Last Update:', time.ctime()))
    window.addstr(1, 1, '%-60s %-30s %-16s %-24s %-24s %-12s ' % (
        'Id', 'User', 'IP', 'Start Time', 'End Time', "Execution Time"),
                  curses.A_BOLD | curses.A_REVERSE)
    finished_jobs = db.child("finished-jobs").order_by_key().limit_to_last(
        50).get()
    if finished_jobs.pyres is not None:
        finished_len = len(finished_jobs.pyres)
        counter = finished_len + 1
        for job in finished_jobs.each():
            data = job.val()
            start = arrow.get(
                data['protoPayload']['serviceData']['jobCompletedEvent'][
                    'job']['jobStatistics']['startTime'])
            end = arrow.get(
                data['protoPayload']['serviceData']['jobCompletedEvent'][
                    'job']['jobStatistics']['endTime'])
            delta = end - start
            window.addstr(counter, 1, '%-60s %-30s %-16s %-24s %-24s %-12s' % (
                data['protoPayload']['serviceData']['jobCompletedEvent'][
                    'job']['jobName']['jobId'][-60:],
                data['protoPayload']['authenticationInfo'][
                    'principalEmail'].split("@")[0],
                data['protoPayload']['requestMetadata']['callerIp'],
                start.format('YYYY-MM-DD HH:mm:ss'),
                end.format('YYYY-MM-DD HH:mm:ss'),
                delta,

            )
                         )
            counter -= 1
    window.addstr(finished_len + 1, 0, ' ' * (maxx - 1))
    window.move(maxy - 2, maxx - 2)



def start_curses(stdscr):
    """
    Init the curser system setup the system and start the main loop.

    :param stdscr:
    """
    maxy, maxx = stdscr.getmaxyx()
    curses.use_default_colors()

    stdscr.addstr(maxy - 1, 0, "Press 'Q' to quit")
    running_window = curses.newpad(1000, maxx)
    finished_window = curses.newpad(1000, maxx)
    while True:
        get_running_jobs(running_window)
        get_finished_jobs(finished_window)
        stdscr.noutrefresh()
        maxy, maxx = stdscr.getmaxyx()
        running_window.noutrefresh(0, 0, 0, 0, int((maxy - 8) / 2),
                                   maxx)
        finished_window.noutrefresh(0, 0, int((maxy - 8) / 2), 0,
                                    maxy - 2, maxx)
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
