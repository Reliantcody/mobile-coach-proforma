import React, { useState } from 'react';
import { FileText, Download, Users, Plus, Trash2, Package } from 'lucide-react';

const MobileCoachQuoteTool = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Customer Information
    businessName: '',
    contactName: '',
    contactNumber: '',
    contactEmail: '',
    
    // Sales Rep
    salesRep: 'Joe Shafe',
    salesRepEmail: 'joseph@clearmedimages.com',
    salesRepPhone: '520-631-7548',
    
    // Equipment Items (array of equipment with ownership details)
    equipment: [
      {
        id: 1,
        type: '',
        specifications: '',
        category: 'coach', // 'coach' or 'modality'
        ownership: 'own', // 'own', 'rent', 'lease'
        rentalMonthly: 0,
        rentalTerm: 60, // months
        leaseAmount: 0,
        leaseTerm: 60,
        leaseRate: 7.99
      }
    ],
    
    // Projection Settings
    projectionYears: 5,
    
    // Key Assumptions
    operatingDaysPerYear: 220,
    scansPerDay: 30,
    blendedRatePerScan: 180,
    serviceContractMonthly: 4167,
    vehicleServiceMonthly: 2083,
    costPerMile: 0.75,
    costPerHourGenerator: 8,
    
    // Lithium Battery Savings
    useLithiumBattery: false,
    lithiumSavingsPerYear: 17600,
    
    // Per Study Costs
    pacsStoragePerStudy: 2,
    radiologistReadPerStudy: 25,
    
    // Staffing
    staff: [
      { role: 'Tech/Driver', salary: 90000 },
      { role: 'Tech/Admin', salary: 90000 }
    ],
    
    // Additional Annual Expenses
    fuelAnnual: 30000,
    insuranceAnnual: 18000,
    marketingAnnual: 25000,
    billingServicePercent: 6,
    medicalSuppliesAnnual: 33000,
    softwareITAnnual: 12000,
    administrativeAnnual: 15000,
    contingencyAnnual: 25000,
    
    // Growth Projections
    year2Growth: 5,
    year3Growth: 3,
    year4Growth: 1.5,
    year5Growth: 0,
    
    // Vehicle Details
    milesPerDay: 50,
    generatorHoursPerDay: 10
  });

  const [quote, setQuote] = useState(null);

  const salesReps = {
    'Joe Shafe': { email: 'joseph@clearmedimages.com', phone: '520-631-7548' },
    'Brian Bernal': { email: 'brian@clearmedimages.com', phone: '520-XXX-XXXX' },
    'Cody Thompson': { email: 'Cody@reliantmedrentals.com', phone: '530-680-6072' }
  };

  // Helper functions
  const formatNumber = (num) => {
    if (num === '' || num === null || num === undefined) return '';
    return Number(num).toLocaleString();
  };

  const parseFormattedNumber = (str) => {
    if (str === '' || str === null || str === undefined) return '';
    return parseFloat(str.toString().replace(/,/g, '')) || 0;
  };

  const calculateLeasePayment = (amount, months, annualRate = 7.99) => {
    if (!amount || amount <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    return payment;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'salesRep') {
      setFormData(prev => ({
        ...prev,
        salesRep: value,
        salesRepEmail: salesReps[value].email,
        salesRepPhone: salesReps[value].phone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value)
      }));
    }
  };

  // Equipment handlers
  const handleEquipmentChange = (index, field, value) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index][field] = value;
    setFormData(prev => ({ ...prev, equipment: newEquipment }));
  };

  const addEquipment = () => {
    const newId = Math.max(...formData.equipment.map(e => e.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, {
        id: newId,
        type: '',
        specifications: '',
        category: 'modality',
        ownership: 'own',
        rentalMonthly: 0,
        rentalTerm: 60,
        leaseAmount: 0,
        leaseTerm: 60,
        leaseRate: 7.99
      }]
    }));
  };

  const removeEquipment = (index) => {
    if (formData.equipment.length > 1) {
      setFormData(prev => ({
        ...prev,
        equipment: prev.equipment.filter((_, i) => i !== index)
      }));
    }
  };

  // Staff handlers
  const handleStaffChange = (index, field, value) => {
    const newStaff = [...formData.staff];
    newStaff[index][field] = field === 'salary' ? parseFormattedNumber(value) : value;
    setFormData(prev => ({ ...prev, staff: newStaff }));
  };

  const addStaff = () => {
    if (formData.staff.length < 5) {
      setFormData(prev => ({
        ...prev,
        staff: [...prev.staff, { role: 'Additional Tech', salary: 90000 }]
      }));
    }
  };

  const removeStaff = (index) => {
    if (formData.staff.length > 1) {
      setFormData(prev => ({
        ...prev,
        staff: prev.staff.filter((_, i) => i !== index)
      }));
    }
  };

  // Get monthly payment for equipment item
  const getEquipmentMonthlyPayment = (equip) => {
    if (equip.ownership === 'rent') return equip.rentalMonthly;
    if (equip.ownership === 'lease') return calculateLeasePayment(equip.leaseAmount, equip.leaseTerm, equip.leaseRate);
    return 0;
  };

  // Get yearly payment for equipment, accounting for lease/rental terms ending
  const getEquipmentYearlyPayment = (equip, yearIndex) => {
    if (equip.ownership === 'own') return 0;
    
    const monthlyPayment = getEquipmentMonthlyPayment(equip);
    
    if (equip.ownership === 'rent') {
      // Calculate which months fall in this year
      const yearStartMonth = yearIndex * 12 + 1;
      const yearEndMonth = (yearIndex + 1) * 12;
      const rentalEndMonth = equip.rentalTerm;
      
      if (yearStartMonth > rentalEndMonth) {
        // Rental already ended before this year started
        return 0;
      }
      
      // Calculate how many months of payment fall within this year
      const monthsOfPayment = Math.min(yearEndMonth, rentalEndMonth) - yearStartMonth + 1;
      return monthlyPayment * monthsOfPayment;
    }
    
    if (equip.ownership === 'lease') {
      // Calculate which months fall in this year (yearIndex 0 = months 1-12, etc.)
      const yearStartMonth = yearIndex * 12 + 1;
      const yearEndMonth = (yearIndex + 1) * 12;
      const leaseEndMonth = equip.leaseTerm;
      
      if (yearStartMonth > leaseEndMonth) {
        // Lease already ended before this year started
        return 0;
      }
      
      // Calculate how many months of payment fall within this year
      const monthsOfPayment = Math.min(yearEndMonth, leaseEndMonth) - yearStartMonth + 1;
      return monthlyPayment * monthsOfPayment;
    }
    
    return 0;
  };

  const calculateQuote = () => {
    const numYears = formData.projectionYears;
    const growthRates = [0, formData.year2Growth, formData.year3Growth, formData.year4Growth, formData.year5Growth, 0]; // Index 0 is Year 1 (0% growth from baseline)
    
    // Build scans by year dynamically
    const scansByYear = [];
    let currentScans = formData.scansPerDay * formData.operatingDaysPerYear;
    for (let i = 0; i < numYears; i++) {
      if (i === 0) {
        scansByYear.push(currentScans);
      } else {
        currentScans = Math.round(currentScans * (1 + (growthRates[i] || 0) / 100));
        scansByYear.push(currentScans);
      }
    }
    
    const revenueByYear = scansByYear.map(scans => scans * formData.blendedRatePerScan);
    
    // Calculate total equipment monthly payments (for display purposes - Year 1)
    const totalEquipmentMonthly = formData.equipment.reduce((sum, equip) => sum + getEquipmentMonthlyPayment(equip), 0);
    
    const calculateYearExpenses = (yearIndex, revenue) => {
      const staffing = formData.staff.reduce((sum, s) => sum + s.salary, 0);
      const serviceContract = formData.serviceContractMonthly * 12;
      const vehicleMaintenance = formData.vehicleServiceMonthly * 12;
      // Calculate equipment payments for this specific year (accounts for lease/rental terms ending)
      const equipmentPayments = formData.equipment.reduce((sum, equip) => sum + getEquipmentYearlyPayment(equip, yearIndex), 0);
      
      const fuel = formData.fuelAnnual * (1 + yearIndex * 0.02);
      const mileage = formData.costPerMile * formData.milesPerDay * formData.operatingDaysPerYear;
      const generator = formData.useLithiumBattery ? 0 : formData.costPerHourGenerator * formData.generatorHoursPerDay * formData.operatingDaysPerYear;
      const lithiumSavings = formData.useLithiumBattery ? formData.lithiumSavingsPerYear : 0;
      
      const pacs = scansByYear[yearIndex] * formData.pacsStoragePerStudy;
      const radiologist = scansByYear[yearIndex] * formData.radiologistReadPerStudy;
      
      const insurance = formData.insuranceAnnual * (1 + yearIndex * 0.03);
      const marketing = formData.marketingAnnual;
      const billingService = revenue * (formData.billingServicePercent / 100);
      const medicalSupplies = formData.medicalSuppliesAnnual * (1 + yearIndex * 0.02);
      const softwareIT = formData.softwareITAnnual * (1 + yearIndex * 0.05);
      const administrative = formData.administrativeAnnual * (1 + yearIndex * 0.02);
      const contingency = formData.contingencyAnnual;
      
      const total = staffing + serviceContract + vehicleMaintenance + equipmentPayments +
                   fuel + mileage + (generator - lithiumSavings) + pacs + radiologist + insurance + 
                   marketing + billingService + medicalSupplies + softwareIT + 
                   administrative + contingency;
      
      return {
        staffing, serviceContract, vehicleMaintenance, equipmentPayments,
        fuel, mileage, generator: generator - lithiumSavings,
        pacs, radiologist, insurance, marketing, billingService, medicalSupplies,
        softwareIT, administrative, contingency, total
      };
    };
    
    const expensesByYear = revenueByYear.map((rev, idx) => calculateYearExpenses(idx, rev));
    const profitByYear = revenueByYear.map((rev, idx) => rev - expensesByYear[idx].total);
    const profitMarginByYear = profitByYear.map((profit, idx) => (profit / revenueByYear[idx]) * 100);
    
    const cumulativeRevenue = revenueByYear.reduce((sum, rev) => sum + rev, 0);
    const cumulativeExpenses = expensesByYear.reduce((sum, exp) => sum + exp.total, 0);
    const cumulativeProfit = cumulativeRevenue - cumulativeExpenses;
    
    const monthlyScans = scansByYear[0] / 12;
    const monthlyRevenue = revenueByYear[0] / 12;
    const monthlyExpenses = expensesByYear[0].total / 12;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    
    const costPerScan = expensesByYear[0].total / scansByYear[0];
    const profitPerScan = profitByYear[0] / scansByYear[0];
    const dailyRevenue = revenueByYear[0] / formData.operatingDaysPerYear;
    const dailyProfit = profitByYear[0] / formData.operatingDaysPerYear;
    
    const fixedCosts = expensesByYear[0].staffing + expensesByYear[0].serviceContract + 
                      expensesByYear[0].vehicleMaintenance + expensesByYear[0].equipmentPayments +
                      expensesByYear[0].insurance + expensesByYear[0].marketing + 
                      expensesByYear[0].softwareIT + expensesByYear[0].administrative + 
                      expensesByYear[0].contingency;
    
    const variableCostPerScan = (expensesByYear[0].fuel + expensesByYear[0].generator + 
                                expensesByYear[0].mileage + expensesByYear[0].pacs + 
                                expensesByYear[0].radiologist + expensesByYear[0].medicalSupplies +
                                expensesByYear[0].billingService) / scansByYear[0];
    
    const contributionMarginPerScan = formData.blendedRatePerScan - variableCostPerScan;
    const monthlyBreakEvenScans = (fixedCosts / 12) / contributionMarginPerScan;
    const dailyBreakEvenScans = monthlyBreakEvenScans / (formData.operatingDaysPerYear / 12);
    
    // Total Capital Invested calculation (only leases count as capital investment)
    let totalCapitalInvested = 0;
    formData.equipment.forEach(equip => {
      if (equip.ownership === 'lease') {
        totalCapitalInvested += equip.leaseAmount;
      }
      // Rentals are operating expenses, not capital investments
    });
    
    const year1ROI = totalCapitalInvested > 0 ? (profitByYear[0] / totalCapitalInvested) * 100 : 0;
    const paybackPeriod = totalCapitalInvested > 0 && profitByYear[0] > 0 ? totalCapitalInvested / profitByYear[0] : 0;
    
    return {
      numYears,
      scansByYear, revenueByYear, expensesByYear, profitByYear, profitMarginByYear,
      cumulativeRevenue, cumulativeExpenses, cumulativeProfit,
      monthlyScans, monthlyRevenue, monthlyExpenses, monthlyProfit,
      costPerScan, profitPerScan, dailyRevenue, dailyProfit,
      fixedCosts, variableCostPerScan, contributionMarginPerScan,
      monthlyBreakEvenScans, dailyBreakEvenScans,
      totalCapitalInvested, year1ROI, paybackPeriod,
      totalEquipmentMonthly,
      quoteDate: new Date().toLocaleDateString(),
      quoteNumber: `MCQ-${Date.now().toString().slice(-8)}`
    };
  };

  const generateQuote = () => {
    setQuote(calculateQuote());
    setStep(4);
  };

  // Button component - simple black/white style
  const Button = ({ onClick, children, className = '' }) => {
    return (
      <button 
        onClick={onClick} 
        className={`px-5 py-2.5 rounded-lg font-semibold bg-white text-black border-2 border-black hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 print:bg-white">
      {/* Header - hidden when printing */}
      <div className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <img 
                  src="/Green Cross Medical Modern Logo.svg" 
                  alt="Reliant Medical Rentals" 
                  className="h-24 w-auto"
                />
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300 mx-2"></div>
              <span className="hidden md:block text-gray-600 font-medium">Mobile Coach Proforma Generator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - hidden when printing */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {['Customer Info', 'Equipment & Costs', 'Financials', 'Generate Quote'].map((label, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm border-2 transition-all duration-300 ${
                    step > idx + 1 
                      ? 'bg-black border-black text-white' 
                      : step === idx + 1 
                        ? 'bg-black border-black text-white shadow-lg transform scale-110' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className={`mt-2 text-[10px] md:text-xs font-medium text-center leading-tight hidden sm:block ${
                    step === idx + 1 ? 'text-black font-semibold' : step > idx + 1 ? 'text-black' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`h-1 flex-1 mx-1 md:mx-3 rounded-full transition-all duration-300 ${
                    step > idx + 1 ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 print:py-0 print:px-0 print:max-w-none">
        
        {/* Step 1: Customer Info */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-black rounded-full"></span>
              Customer Information
            </h2>
            
            <div className="space-y-6">
              {/* Customer Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e] transition-all"
                      placeholder="Enter business name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name <span className="text-red-500">*</span></label>
                    <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e] transition-all"
                      placeholder="Primary contact person" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e] transition-all"
                      placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e] transition-all"
                      placeholder="contact@business.com" />
                  </div>
                </div>
              </div>

              {/* Sales Representative */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Sales Representative</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Rep</label>
                    <select name="salesRep" value={formData.salesRep} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4] transition-all">
                      <option value="Joe Shafe">Joe Shafe</option>
                      <option value="Brian Bernal">Brian Bernal</option>
                      <option value="Cody Thompson">Cody Thompson</option>
                    </select>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Contact Info</p>
                    <p className="text-sm text-gray-800">{formData.salesRepEmail}</p>
                    <p className="text-sm text-gray-800">{formData.salesRepPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <Button onClick={() => {
                if (!formData.businessName || !formData.contactName || !formData.contactNumber || !formData.contactEmail) {
                  alert('Please fill in all required fields');
                  return;
                }
                setStep(2);
              }}>
                Next: Equipment & Costs →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Equipment & Costs */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-black rounded-full"></span>
              Equipment & Ownership
            </h2>
            
            <div className="space-y-6">
              {/* Equipment Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Equipment Items
                  </h3>
                  <Button onClick={addEquipment} className="text-sm py-2">
                    <Plus className="w-4 h-4" /> Add Equipment
                  </Button>
                </div>

                {formData.equipment.map((equip, idx) => (
                  <div key={equip.id} className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Equipment #{idx + 1}</span>
                      {formData.equipment.length > 1 && (
                        <button onClick={() => removeEquipment(idx)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type <span className="text-red-500">*</span></label>
                        <input type="text" value={equip.type} 
                          onChange={(e) => handleEquipmentChange(idx, 'type', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]"
                          placeholder="e.g., Mobile MRI, CT Scanner" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={equip.category} onChange={(e) => handleEquipmentChange(idx, 'category', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]">
                          <option value="coach">Coach/Vehicle</option>
                          <option value="modality">Modality/Equipment</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                      <textarea value={equip.specifications} rows="2"
                        onChange={(e) => handleEquipmentChange(idx, 'specifications', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e] resize-y"
                        placeholder="Model, features, special requirements..." />
                    </div>

                    {/* Ownership Options */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ownership Type</label>
                      <div className="flex gap-3">
                        {['own', 'rent', 'lease'].map(opt => (
                          <label key={opt} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                            equip.ownership === opt 
                              ? 'border-[#03989e] bg-[#03989e]/10 text-[#03989e]' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input type="radio" checked={equip.ownership === opt}
                              onChange={() => handleEquipmentChange(idx, 'ownership', opt)}
                              className="w-4 h-4 text-[#03989e]" />
                            <span className="text-sm font-medium capitalize">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rent Fields */}
                    {equip.ownership === 'rent' && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rental ($)</label>
                            <input type="text" value={formatNumber(equip.rentalMonthly)}
                              onChange={(e) => handleEquipmentChange(idx, 'rentalMonthly', parseFormattedNumber(e.target.value))}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rental Term (months)</label>
                            <select value={equip.rentalTerm} onChange={(e) => handleEquipmentChange(idx, 'rentalTerm', parseInt(e.target.value))}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <option value={12}>12 months (1 year)</option>
                              <option value={24}>24 months (2 years)</option>
                              <option value={36}>36 months (3 years)</option>
                              <option value={48}>48 months (4 years)</option>
                              <option value={60}>60 months (5 years)</option>
                              <option value={72}>72 months (6 years)</option>
                            </select>
                          </div>
                        </div>
                        {equip.rentalMonthly > 0 && (
                          <div className="mt-3 bg-white p-3 rounded-lg border border-blue-300">
                            <p className="text-sm text-gray-600">Total Rental Cost ({equip.rentalTerm} months):</p>
                            <p className="text-xl font-bold text-blue-600">
                              ${(equip.rentalMonthly * equip.rentalTerm).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lease Fields */}
                    {equip.ownership === 'lease' && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lease Amount ($)</label>
                            <input type="text" value={formatNumber(equip.leaseAmount)}
                              onChange={(e) => handleEquipmentChange(idx, 'leaseAmount', parseFormattedNumber(e.target.value))}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                            <input type="number" value={equip.leaseRate} step="0.01"
                              onChange={(e) => handleEquipmentChange(idx, 'leaseRate', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Term (months)</label>
                            <select value={equip.leaseTerm} onChange={(e) => handleEquipmentChange(idx, 'leaseTerm', parseInt(e.target.value))}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                              <option value={48}>48 months</option>
                              <option value={60}>60 months</option>
                              <option value={72}>72 months</option>
                            </select>
                          </div>
                        </div>
                        {equip.leaseAmount > 0 && (
                          <div className="bg-white p-3 rounded-lg border border-purple-300">
                            <p className="text-sm text-gray-600">Monthly Payment ({equip.leaseRate}% APR):</p>
                            <p className="text-xl font-bold text-[#03989e]">
                              ${calculateLeasePayment(equip.leaseAmount, equip.leaseTerm, equip.leaseRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Staffing */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Staffing
                  </h3>
                  {formData.staff.length < 5 && (
                    <Button onClick={addStaff} className="text-sm py-2">
                      <Plus className="w-4 h-4" /> Add Staff
                    </Button>
                  )}
                </div>

                {formData.staff.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-4 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                      <input type="text" value={s.role} onChange={(e) => handleStaffChange(idx, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Annual Salary ($)</label>
                      <input type="text" value={formatNumber(s.salary)} 
                        onChange={(e) => handleStaffChange(idx, 'salary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4]" />
                    </div>
                    {formData.staff.length > 1 && (
                      <button onClick={() => removeStaff(idx)} className="text-red-500 hover:text-red-700 p-2 mt-5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Service Contracts */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Service Contracts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Service ($/month)</label>
                    <input type="text" value={formatNumber(formData.serviceContractMonthly)}
                      onChange={(e) => setFormData(prev => ({...prev, serviceContractMonthly: parseFormattedNumber(e.target.value)}))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" />
                    <p className="text-xs text-gray-500 mt-1">Annual: ${(formData.serviceContractMonthly * 12).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Service ($/month)</label>
                    <input type="text" value={formatNumber(formData.vehicleServiceMonthly)}
                      onChange={(e) => setFormData(prev => ({...prev, vehicleServiceMonthly: parseFormattedNumber(e.target.value)}))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" />
                    <p className="text-xs text-gray-500 mt-1">Annual: ${(formData.vehicleServiceMonthly * 12).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Projection Settings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">ROI Projection Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Projection Period</label>
                    <select name="projectionYears" value={formData.projectionYears} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4]">
                      <option value={1}>1 Year (12 months)</option>
                      <option value={2}>2 Years (24 months)</option>
                      <option value={3}>3 Years (36 months)</option>
                      <option value={4}>4 Years (48 months)</option>
                      <option value={5}>5 Years (60 months)</option>
                      <option value={6}>6 Years (72 months)</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-[#ff66c4]/10 p-3 rounded-lg border border-[#ff66c4]/30 text-sm text-gray-700">
                      <p><span className="font-semibold text-[#ff66c4]">Tip:</span> Match this to your longest rental/lease term for accurate ROI analysis.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={() => {
                const hasEmptyEquipment = formData.equipment.some(e => !e.type);
                if (hasEmptyEquipment) {
                  alert('Please fill in equipment type for all items');
                  return;
                }
                setStep(3);
              }}>
                Next: Financials →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Financials */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-black rounded-full"></span>
              Financial Assumptions
            </h2>
            
            <div className="space-y-6">
              {/* Operating Metrics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Operating Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operating Days/Year</label>
                    <input type="number" name="operatingDaysPerYear" value={formData.operatingDaysPerYear} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scans per Day</label>
                    <input type="number" name="scansPerDay" value={formData.scansPerDay} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blended Rate/Scan ($)</label>
                    <input type="number" name="blendedRatePerScan" value={formData.blendedRatePerScan} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" />
                  </div>
                </div>
              </div>

              {/* Annual Expenses */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Annual Operating Expenses</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'fuelAnnual', label: 'Fuel' },
                    { name: 'insuranceAnnual', label: 'Insurance' },
                    { name: 'marketingAnnual', label: 'Marketing' },
                    { name: 'medicalSuppliesAnnual', label: 'Medical Supplies' },
                    { name: 'softwareITAnnual', label: 'Software/IT' },
                    { name: 'administrativeAnnual', label: 'Administrative' },
                    { name: 'contingencyAnnual', label: 'Contingency' }
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label} ($)</label>
                      <input type="text" value={formatNumber(formData[field.name])}
                        onChange={(e) => setFormData(prev => ({...prev, [field.name]: parseFormattedNumber(e.target.value)}))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4]" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Service (%)</label>
                    <input type="number" name="billingServicePercent" value={formData.billingServicePercent} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4]" step="0.1" />
                  </div>
                </div>
              </div>

              {/* Growth Projections */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Growth Projections (%)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['year2Growth', 'year3Growth', 'year4Growth', 'year5Growth'].map((field, idx) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year {idx + 2}</label>
                      <input type="number" name={field} value={formData[field]} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" step="0.1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle & Per Study */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Vehicle Costs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Miles/Day</label>
                      <input type="number" name="milesPerDay" value={formData.milesPerDay} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Mile ($)</label>
                      <input type="number" name="costPerMile" value={formData.costPerMile} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff66c4] focus:border-[#ff66c4]" step="0.01" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Per Study Costs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PACS Storage ($)</label>
                      <input type="number" name="pacsStoragePerStudy" value={formData.pacsStoragePerStudy} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Radiologist Read ($)</label>
                      <input type="number" name="radiologistReadPerStudy" value={formData.radiologistReadPerStudy} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03989e] focus:border-[#03989e]" step="0.01" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={generateQuote}>
                ✨ Generate Proforma
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Quote Display */}
        {step === 4 && quote && (
          <div className="space-y-4 print:space-y-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 print:shadow-none print:border-none print:rounded-none print:p-0">
              {/* Quote Header */}
              <div className="border-b-2 border-black pb-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/Green Cross Medical Modern Logo.svg" 
                      alt="Reliant Medical Rentals" 
                      className="h-24 sm:h-32 w-auto"
                    />
                  </div>
                  <div className="sm:text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-black">PROFORMA</h2>
                    <p className="text-gray-600 text-sm">#{quote.quoteNumber}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{quote.quoteDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Bill To</p>
                    <p className="font-semibold text-gray-900">{formData.businessName}</p>
                    <p className="text-gray-700">{formData.contactName}</p>
                    <p className="text-gray-600 text-sm">{formData.contactNumber}</p>
                    <p className="text-gray-600 text-sm">{formData.contactEmail}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Prepared By</p>
                    <p className="font-semibold text-gray-900">{formData.salesRep}</p>
                    <p className="text-gray-600 text-sm">{formData.salesRepEmail}</p>
                    <p className="text-gray-600 text-sm">{formData.salesRepPhone}</p>
                  </div>
                </div>
              </div>

              {/* Equipment Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Equipment & Pricing</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full px-4 sm:px-0">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300">Equipment</th>
                          <th className="text-left px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300">Category</th>
                          <th className="text-left px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300">Ownership</th>
                          <th className="text-right px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300">Amount/Value</th>
                          <th className="text-right px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300">Monthly Payment</th>
                        </tr>
                      </thead>
                    <tbody>
                      {formData.equipment.map((equip, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 border border-gray-300 text-sm">
                            <p className="font-medium text-gray-900">{equip.type}</p>
                          </td>
                          <td className="px-3 py-2 border border-gray-300 capitalize text-gray-700 text-sm">{equip.category}</td>
                          <td className="px-3 py-2 border border-gray-300 text-gray-700 text-sm">
                            <span className="capitalize">{equip.ownership}</span>
                            {equip.ownership === 'rent' && <span className="text-xs text-gray-500 ml-1">({equip.rentalTerm} mo)</span>}
                            {equip.ownership === 'lease' && <span className="text-xs text-gray-500 ml-1">({equip.leaseTerm} mo)</span>}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-right text-gray-700 text-sm">
                            {equip.ownership === 'own' ? '—' : 
                             equip.ownership === 'rent' ? 'N/A' :
                             `$${formatNumber(equip.leaseAmount)}`}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-right font-semibold text-[#03989e] text-sm">
                            {equip.ownership === 'own' ? '$0' : 
                             `$${getEquipmentMonthlyPayment(equip).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="4" className="px-3 py-2 border border-gray-300 text-right text-sm">Total Monthly Equipment Cost:</td>
                        <td className="px-3 py-2 border border-gray-300 text-right text-[#03989e] text-sm">
                          ${quote.totalEquipmentMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>

              {/* Equipment Specifications - Only show if any equipment has specifications */}
              {formData.equipment.some(equip => equip.specifications) && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Equipment Specifications</h3>
                  <div className="space-y-4">
                    {formData.equipment.filter(equip => equip.specifications).map((equip, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#03989e] rounded-full"></span>
                          {equip.type}
                          <span className="text-xs font-normal text-gray-500 capitalize">({equip.category})</span>
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-line pl-4 border-l-2 border-[#03989e]/30">
                          {equip.specifications}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Assumptions */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Key Assumptions</h3>
                <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-[#03989e]/10 to-[#ff66c4]/10 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Operating Days/Year</p>
                    <p className="text-xl font-bold text-[#03989e]">{formData.operatingDaysPerYear}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Scans per Day</p>
                    <p className="text-xl font-bold text-[#03989e]">{formData.scansPerDay}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Blended Rate/Scan</p>
                    <p className="text-xl font-bold text-[#03989e]">${formData.blendedRatePerScan}</p>
                  </div>
                </div>
              </div>

              {/* Financial Projection P&L */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{quote.numYears}-Year Financial Projection</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full px-4 sm:px-0">
                    <table className="w-full border-collapse text-xs sm:text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 sm:px-3 py-2 text-left border border-gray-300">Year</th>
                          <th className="px-2 sm:px-3 py-2 text-right border border-gray-300">Scans</th>
                          <th className="px-2 sm:px-3 py-2 text-right border border-gray-300">Revenue</th>
                          <th className="px-2 sm:px-3 py-2 text-right border border-gray-300">Expenses</th>
                          <th className="px-2 sm:px-3 py-2 text-right border border-gray-300">Net Profit</th>
                          <th className="px-2 sm:px-3 py-2 text-right border border-gray-300">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.revenueByYear.map((rev, idx) => (
                          <tr key={idx}>
                            <td className="px-2 sm:px-3 py-2 border border-gray-300 font-medium">Year {idx + 1}</td>
                            <td className="px-2 sm:px-3 py-2 border border-gray-300 text-right">{quote.scansByYear[idx].toLocaleString()}</td>
                            <td className="px-2 sm:px-3 py-2 border border-gray-300 text-right">${rev.toLocaleString()}</td>
                            <td className="px-2 sm:px-3 py-2 border border-gray-300 text-right">${Math.round(quote.expensesByYear[idx].total).toLocaleString()}</td>
                            <td className="px-2 sm:px-3 py-2 border border-gray-300 text-right font-semibold text-green-600">${Math.round(quote.profitByYear[idx]).toLocaleString()}</td>
                            <td className="px-2 sm:px-3 py-2 border border-gray-300 text-right">{quote.profitMarginByYear[idx].toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Totals & Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">{quote.numYears}-Year Totals</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-semibold text-green-600">${Math.round(quote.cumulativeRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expenses:</span>
                      <span className="font-semibold text-gray-700">${Math.round(quote.cumulativeExpenses).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2">
                      <span className="text-gray-700 font-medium">Net Profit:</span>
                      <span className="font-bold text-green-600">${Math.round(quote.cumulativeProfit).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Daily & Monthly Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Revenue:</span>
                      <span className="font-semibold text-blue-600">${Math.round(quote.dailyRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Profit:</span>
                      <span className="font-semibold text-green-600">${Math.round(quote.dailyProfit).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <span className="font-semibold text-blue-600">${Math.round(quote.monthlyRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Profit:</span>
                      <span className="font-semibold text-green-600">${Math.round(quote.monthlyProfit).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Break-Even & ROI */}
              <div className={`grid gap-6 mb-6 grid-cols-1 ${quote.totalCapitalInvested > 0 ? 'sm:grid-cols-2' : ''}`}>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Break-Even Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Break-Even:</span>
                      <span className="font-bold text-orange-600">{quote.dailyBreakEvenScans.toFixed(1)} scans</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Break-Even:</span>
                      <span className="font-bold text-orange-600">{Math.round(quote.monthlyBreakEvenScans)} scans</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profit per Scan:</span>
                      <span className="font-semibold text-green-600">${quote.profitPerScan.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {quote.totalCapitalInvested > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Return on Investment (Leased Equipment)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Lease Capital:</span>
                        <span className="font-semibold text-gray-700">${Math.round(quote.totalCapitalInvested).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year 1 ROI:</span>
                        <span className="font-bold text-[#03989e]">{quote.year1ROI.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payback Period:</span>
                        <span className="font-bold text-[#ff66c4]">{quote.paybackPeriod.toFixed(1)} years</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
                <p className="font-semibold mb-1">Terms & Conditions:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>This proforma is valid for 30 days from the date of issue</li>
                  <li>All financial projections are estimates based on provided assumptions</li>
                  <li>Actual results may vary based on operational performance</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 print:hidden">
              <Button onClick={() => setStep(3)}>← Edit</Button>
              <Button onClick={() => window.print()}>
                <Download className="w-4 h-4" /> Print / Save PDF
              </Button>
              <Button onClick={() => { setStep(1); setQuote(null); }}>
                <FileText className="w-4 h-4" /> New Quote
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:space-y-0 > * + * { margin-top: 0 !important; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  );
};

export default MobileCoachQuoteTool;
