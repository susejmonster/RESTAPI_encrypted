import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import React, { useState } from "react";
import "../../global.css";
import { TransactionChart } from "../services/charts.js";
import { useEmployeeData } from "../services/fetch.js";

Chart.register(CategoryScale);

interface Employee {
  employeeid: number;
  firstname: string;
  lastname: string;
  dateofbirth: string;
  gender: string;
  departmentid: number;
  salary: string;
  hiredate: string;
}

interface TransactionFormData {
  amount: string;
  transactiondate: string;
  description: string;
  categoryname: string;
  categorytype: string;
}

export default function App() {
  const { 
    employees, 
    loading, 
    error, 
    totalBalance,
    Bills,
    upcomingTransactions,
    usertransactions,
    recentTransactions,
  } = useEmployeeData(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: "",
    transactiondate: "",
    description: "",
    categoryname: "",
    categorytype: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:3000/eeid?employeeid=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeid: 1, // Fixes the database "null value in column employeeid" error
        amount: parseFloat(formData.amount), // Ensures amount is a number
        transactiondate: formData.transactiondate,
        description: formData.description,
        categoryname: formData.categoryname,
        categorytype: formData.categorytype,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Keep this INSIDE the try block, right after the fetch!
    const result = await response.json();
    console.log("Transaction successfully saved:", result);

    // Close modal and reset form state on success
    setIsModalOpen(false);
    setFormData({
      amount: "",
      transactiondate: "",
      description: "",
      categoryname: "",
      categorytype: "",
    });

  } catch (err) {
    console.error("Failed to post transaction:", err);
  }
};


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-600 font-medium">
        Loading employee data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-red-500 font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 p-6 box-border overflow-hidden relative">
      
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Hello <span>{employees[0] ? `${employees[0].firstname} ${employees[0].lastname}` : "User"}</span>
        </h1>
        <h2 className="text-slate-500 font-medium text-sm mt-1">
          Thursday, October 5th
        </h2>

       {/* 3 small fixed-size square buttons */}
        <div className="flex flex-row gap-3 mt-4">
          <button className="h-10 w-10 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all">
            1
          </button>
          <button className="h-10 w-10 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all">
            2
          </button>
          
          {/* Replaced Button 3 with + icon modal trigger */}
          <button 
            onClick={() => setIsModalOpen(true)}
            aria-label="Add Transaction"
            className="h-10 w-10 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards section */}
      <section className="flex-1 flex flex-col gap-4 w-full">
        <div className="flex-[1] flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold">
            {employees[0] ? `${employees[0].salary} ` : "User"}
          </div>
          <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold">
            {employees[0] ? `Balance: $${totalBalance}` : "Balance: $0"}
          </div>
          <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold">
            {upcomingTransactions.length > 0 ? `Upcoming: $${Bills}` : "Upcoming: $0"}
          </div>
        </div>

        <div className="flex-[4] flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-center font-semibold">
            <TransactionChart usertransactions={usertransactions} />
          </div>

          <div className="w-full md:w-1/4 bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
            <ul className="flex flex-col gap-2.5 w-full">
              {recentTransactions.map((tx) => (
                <li 
                  key={tx.transactionid} 
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{tx.description}</span>
                    <small className="text-slate-400 text-xs">
                      {tx.transactiondate ? tx.transactiondate.split("T")[0] : ""}
                    </small>
                  </div>
                  <span className="font-semibold text-slate-700">
                    ${Number(tx.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Transaction</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. Housing Tax"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Date</label>
                <input
                  type="datetime-local"
                  name="transactiondate"
                  required
                  value={formData.transactiondate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name</label>
                <input
                  type="text"
                  name="categoryname"
                  placeholder="e.g. Performance Bonus"
                  value={formData.categoryname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Type</label>
                <input
                  type="text"
                  name="categorytype"
                  placeholder="e.g. Bonus, Tax, Income"
                  value={formData.categorytype}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}