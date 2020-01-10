import React from 'react';
import { render} from 'react-dom';
import {StockChart} from '../../src/index';
const App = () => (
 <StockChart />
);
render(<App />, document.getElementById("root"));