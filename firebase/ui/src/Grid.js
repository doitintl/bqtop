import React, { Component } from 'react';

import './Grid.css'

import {
  SpringGrid,
  CSSGrid,
  makeResponsive,
  measureItems,
  layout as layouts,
  enterExitStyle as enterExitStyles
} from 'react-stonecutter';

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = this.createGrid(props);
  }

  createGrid = ({ useCSS, measured, responsive }) => {
    let Grid = useCSS ? CSSGrid : SpringGrid;

    if (measured) {
      Grid = measureItems(Grid);
    }

    if (responsive) {
      Grid = makeResponsive(Grid, {
        maxWidth: 1920,
        minPadding: 0,
        defaultColumns: 5
      });
    }

    return { Grid };
  };

  render() {
    const {
      children,
      useCSS,
      responsive,
      layout,
      enterExitStyle,
      duration,
      easing,
      stiffness,
      damping,
      gutters,
      columns,
      ...rest
    } = this.props;

    const { Grid } = this.state;

    const gridLayout = layouts[layout];
    const gridEnterExitStyle = enterExitStyles[enterExitStyle];

    return (
      <Grid
        {...rest}
        className="grid"
        component="ul"
        columns={!responsive ? columns : null}
        columnWidth={200}
        gutterWidth={gutters + 10}
        gutterHeight={gutters}
        layout={gridLayout}
        enter={gridEnterExitStyle.enter}
        entered={gridEnterExitStyle.entered}
        exit={gridEnterExitStyle.exit}
        perspective={600}
        duration={useCSS ? duration : null}
        easing={useCSS ? easing : null}
        springConfig={
          !useCSS && stiffness && damping ? { stiffness, damping } : null
        }
      >
        {children}
      </Grid>
    );
  }
}

export default Grid;
