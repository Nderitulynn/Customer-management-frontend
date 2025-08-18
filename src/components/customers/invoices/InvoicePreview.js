import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import InvoiceService from '../../../services/invoiceService';
import InvoiceStatusBadge from './InvoiceStatusBadge';

const InvoicePreview = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For school project, this could just show a message
    alert('PDF download functionality would be implemented here');
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md"
              title="Print Invoice"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 bg-white" id="invoice-content">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  <strong>Invoice Number:</strong> {invoice.invoiceNumber}
                </div>
                <div className="mb-1">
                  <strong>Invoice Date:</strong> {InvoiceService.formatDate(invoice.invoiceDate)}
                </div>
                <div className="mb-1">
                  <strong>Due Date:</strong> {InvoiceService.formatDate(invoice.dueDate)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-4">
                <InvoiceStatusBadge 
                  status={invoice.status} 
                  isOverdue={InvoiceService.isInvoiceOverdue(invoice)}
                />
              </div>
              
              {/* Company Information (placeholder) */}
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-gray-900">Your Company Name</div>
                <div>123 Business Street</div>
                <div>Nairobi, Kenya</div>
                <div>Phone: +254 XXX XXX XXX</div>
                <div>Email: info@yourcompany.com</div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-gray-900 mb-1">
                    {invoice.customerName}
                  </div>
                  <div>{invoice.customerEmail}</div>
                  {invoice.customerPhone && (
                    <div>{invoice.customerPhone}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Terms:</h3>
                <div className="text-sm text-gray-700">
                  {invoice.paymentTerms || 'Net 30 days'}
                </div>
                
                {InvoiceService.isInvoiceOverdue(invoice) && (
                  <div className="mt-2 text-red-600 font-semibold">
                    Overdue by {Math.abs(InvoiceService.getDaysUntilDue(invoice.dueDate))} days
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Item/Service
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Unit Price
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {InvoiceService.formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium">
                      {InvoiceService.formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {InvoiceService.formatCurrency(invoice.subtotal)}
                  </span>
                </div>
                
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">
                      {InvoiceService.formatCurrency(invoice.taxAmount)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {InvoiceService.formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
              <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                {invoice.notes}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information:</h3>
                <div className="text-sm text-gray-700">
                  <div className="mb-2">
                    <strong>Bank:</strong> Your Bank Name
                  </div>
                  <div className="mb-2">
                    <strong>Account Number:</strong> XXXX-XXXX-XXXX
                  </div>
                  <div className="mb-2">
                    <strong>Swift Code:</strong> XXXXXX
                  </div>
                  <div className="mb-2">
                    <strong>Reference:</strong> {invoice.invoiceNumber}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                <div className="text-sm text-gray-700">
                  <div className="mb-2">
                    <strong>Created:</strong> {InvoiceService.formatDateTime(invoice.createdAt)}
                  </div>
                  {invoice.sentAt && (
                    <div className="mb-2">
                      <strong>Sent:</strong> {InvoiceService.formatDateTime(invoice.sentAt)}
                    </div>
                  )}
                  {invoice.paidAt && (
                    <div className="mb-2">
                      <strong>Paid:</strong> {InvoiceService.formatDateTime(invoice.paidAt)}
                    </div>
                  )}
                  {invoice.orderId && (
                    <div className="mb-2">
                      <strong>Order Reference:</strong> {invoice.orderId.orderNumber || invoice.orderId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-200">
            <p>Thank you for your business!</p>
            <p className="mt-2">
              This invoice was generated on {InvoiceService.formatDateTime(new Date())}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;