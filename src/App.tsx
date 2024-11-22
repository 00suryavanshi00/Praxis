import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import InvoiceProcessing from './components/InvoiceProcessing';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <InvoiceProcessing />
      </div>
    </Provider>
  );
};

export default App;