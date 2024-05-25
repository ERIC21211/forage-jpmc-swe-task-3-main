import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',     // Average price of ABC, stored as a floating-point number
      price_def: 'float',     // Average price of DEF, stored as a floating-point number
      ratio: 'float',         // Ratio of priceABC to priceDEF, stored as a floating-point number
      timestamp: 'date',      // Timestamp of the latest server response, stored as a date
      upper_bound: 'float',   // Upper bound for the ratio, stored as a floating-point number
      lower_bound: 'float',   // Lower bound for the ratio, stored as a floating-point number
      trigger_alert: 'float', // Ratio value that triggers the alert, stored as a floating-point number (optional field)
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');  // Set the view type to 'y_line' in the perspective viewer for better visual representation.
      elem.setAttribute('row-pivots', '["timestamp"]'); // Configure the perspective viewer to use 'timestamp' as the row pivot. // This allows the data to be grouped and displayed by timestamp.                                                      
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'); // Specify the columns to be displayed in the perspective viewer. // The columns include 'ratio', 'lower_bound', 'upper_bound', and 'trigger_alert'.
      elem.setAttribute('aggregates', JSON.stringify({ 
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData); 
    }
  }
}

export default Graph;
