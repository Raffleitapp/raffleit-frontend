import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download,
  RefreshCw,
  AlertTriangle,
  Target,
  Activity,
  Trophy,
  BarChart3,
  CheckCircle,
  ChevronDown,
  FileSpreadsheet,
  File,
  FileText
} from 'lucide-react';
import apiClient from '../../utils/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReportData {
  total_revenue: number;
  total_transactions: number;
  avg_transaction_value: number;
  success_rate: number;
  pending_transactions: number;
  failed_transactions: number;
  transaction_trends: Array<{
    date: string;
    transactions: number;
    revenue: number;
  }>;
  payment_methods: Record<string, { 
    count: number; 
    revenue: number; 
    successful_count: number; 
    failed_count: number; 
    avg_amount: number; 
    success_rate: number; 
  }>;
}

interface UserMetrics {
  total_users: number;
  new_users: number;
  active_users: number;
  new_users_today: number;
  user_growth_rate: number;
  user_retention_rate: number;
  users_by_role: Record<string, number>;
  top_users_by_spending: Array<{
    user_id: number;
    name: string;
    email: string;
    total_spent: number;
    total_transactions: number;
  }>;
}

interface RaffleMetrics {
  total_raffles: number;
  active_raffles: number;
  completed_raffles: number;
  new_raffles: number;
  avg_participation: number;
  completion_rate: number;
  total_tickets_sold: number;
  raffles_by_category: Record<string, number>;
  top_raffles_by_revenue: Array<{
    raffle_id: number;
    title: string;
    ticket_price: number;
    tickets_sold: number;
    total_revenue: number;
    total_transactions: number;
  }>;
  raffle_performance: {
    total_created: number;
    fully_sold: number;
    average_fill_rate: number;
    average_duration: number;
  };
}

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [raffleMetrics, setRaffleMetrics] = useState<RaffleMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('financial');
  const [refreshing, setRefreshing] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Error boundary-like error handling
  const [hasRenderError, setHasRenderError] = useState(false);

  // Fetch report data
  const fetchReportData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [paymentsRes, usersRes, rafflesRes] = await Promise.all([
        apiClient.get(`/admin/analytics/payments?period=${period}`),
        apiClient.get(`/admin/analytics/users?period=${period}`),
        apiClient.get(`/admin/analytics/raffles?period=${period}`)
      ]);

      // Use the payment_methods data from the main payments analytics
      // which has the correct structure expected by the frontend
      setReportData(paymentsRes.data.data);

      // Use real user metrics from API instead of estimations
      setUserMetrics(usersRes.data.data);

      // Use real raffle metrics from API instead of estimations
      setRaffleMetrics(rafflesRes.data.data);

      setError(null);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReportData();
    }
  }, [user, period]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown && !(event.target as Element).closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    
    // Add header with branding
    doc.setFillColor(71, 85, 105); // Slate color
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add logo/company name
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('RaffleIt', 20, 25);
    
    // Add subtitle
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Analytics Report', 20, 35);
    
    // Add report period and date
    doc.setFontSize(10);
    doc.text(`Period: ${period.toUpperCase()} | Generated: ${currentDate}`, 120, 25);
    doc.text(`Report ID: ${Date.now()}`, 120, 35);
    
    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 55;
    
    // Financial Summary Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Financial Summary', 20, yPosition);
    yPosition += 5;
    
    // Add a line under the section header
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;
    
    if (reportData) {
      const financialData = [
        ['Total Revenue', `$${reportData.total_revenue?.toFixed(2) || 0}`],
        ['Total Transactions', reportData.total_transactions?.toString() || '0'],
        ['Average Transaction Value', `$${reportData.avg_transaction_value?.toFixed(2) || 0}`],
        ['Success Rate', `${reportData.success_rate?.toFixed(1) || 0}%`],
        ['Pending Transactions', reportData.pending_transactions?.toString() || '0'],
        ['Failed Transactions', reportData.failed_transactions?.toString() || '0']
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: financialData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // User Metrics Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('👥 User Metrics', 20, yPosition);
    yPosition += 5;
    
    // Add section line
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;
    
    if (userMetrics) {
      const userData = [
        ['Total Users', userMetrics.total_users?.toString() || '0'],
        ['New Users', userMetrics.new_users?.toString() || '0'],
        ['Active Users', userMetrics.active_users?.toString() || '0'],
        ['New Users Today', userMetrics.new_users_today?.toString() || '0'],
        ['User Growth Rate', `${userMetrics.user_growth_rate?.toFixed(1) || 0}%`],
        ['User Retention Rate', `${userMetrics.user_retention_rate?.toFixed(1) || 0}%`]
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: userData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Raffle Metrics Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Raffle Metrics', 20, yPosition);
    yPosition += 5;
    
    // Add section line
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;
    
    if (raffleMetrics) {
      const raffleData = [
        ['Total Raffles', raffleMetrics.total_raffles?.toString() || '0'],
        ['Active Raffles', raffleMetrics.active_raffles?.toString() || '0'],
        ['Completed Raffles', raffleMetrics.completed_raffles?.toString() || '0'],
        ['New Raffles', raffleMetrics.new_raffles?.toString() || '0'],
        ['Average Participation', raffleMetrics.avg_participation?.toFixed(1) || '0'],
        ['Completion Rate', `${raffleMetrics.completion_rate?.toFixed(1) || 0}%`],
        ['Total Tickets Sold', raffleMetrics.total_tickets_sold?.toString() || '0']
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: raffleData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Payment Methods Section
    if (reportData?.payment_methods && Object.keys(reportData.payment_methods).length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('💳 Payment Methods Performance', 20, yPosition);
      yPosition += 5;
      
      // Add section line
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      const paymentData = Object.entries(reportData.payment_methods).map(([method, data]) => {
        // Add safety checks for payment method data
        const safeData = {
          count: data?.count || 0,
          revenue: Number(data?.revenue || 0),
          successful_count: data?.successful_count || 0,
          failed_count: data?.failed_count || 0,
          avg_amount: Number(data?.avg_amount || 0),
          success_rate: Number(data?.success_rate || 0)
        };
        
        return [
          method,
          safeData.count.toString(),
          safeData.successful_count.toString(),
          safeData.failed_count.toString(),
          `${safeData.success_rate.toFixed(1)}%`,
          `$${safeData.revenue.toFixed(2)}`,
          `$${safeData.avg_amount.toFixed(2)}`
        ];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Method', 'Total', 'Success', 'Failed', 'Success Rate', 'Revenue', 'Avg Amount']],
        body: paymentData,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Add footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 280, 210, 17, 'F');
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('RaffleIt Analytics Report', 20, 290);
      doc.text(`Page ${i} of ${pageCount}`, 170, 290);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 295);
      
      // Website
      doc.setTextColor(59, 130, 246);
      doc.text('www.raffleit.com', 150, 295);
    }
    
    // Save the PDF
    doc.save(`raffleit-analytics-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Financial Summary Sheet
    if (reportData) {
      const financialData = [
        ['Metric', 'Value'],
        ['Total Revenue', reportData.total_revenue || 0],
        ['Total Transactions', reportData.total_transactions || 0],
        ['Average Transaction Value', reportData.avg_transaction_value || 0],
        ['Success Rate (%)', reportData.success_rate || 0],
        ['Pending Transactions', reportData.pending_transactions || 0],
        ['Failed Transactions', reportData.failed_transactions || 0]
      ];
      
      // Add payment methods data
      if (reportData.payment_methods && Object.keys(reportData.payment_methods).length > 0) {
        financialData.push(['', '']);
        financialData.push(['Payment Methods Performance', '']);
        financialData.push(['Method', 'Total Trans.', 'Successful', 'Failed', 'Success Rate (%)', 'Revenue', 'Avg Amount']);
        Object.entries(reportData.payment_methods).forEach(([method, data]) => {
          financialData.push([
            method, 
            data.count, 
            data.successful_count, 
            data.failed_count, 
            data.success_rate, 
            data.revenue, 
            data.avg_amount
          ]);
        });
      }
      
      // Add transaction trends
      if (reportData.transaction_trends && reportData.transaction_trends.length > 0) {
        financialData.push(['', '']);
        financialData.push(['Transaction Trends', '']);
        financialData.push(['Date', 'Transactions', 'Revenue']);
        reportData.transaction_trends.forEach(trend => {
          financialData.push([trend.date, trend.transactions, trend.revenue]);
        });
      }
      
      const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
      XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial Summary');
    }
    
    // User Metrics Sheet
    if (userMetrics) {
      const userData = [
        ['Metric', 'Value'],
        ['Total Users', userMetrics.total_users || 0],
        ['New Users', userMetrics.new_users || 0],
        ['Active Users', userMetrics.active_users || 0],
        ['New Users Today', userMetrics.new_users_today || 0],
        ['User Growth Rate (%)', userMetrics.user_growth_rate || 0],
        ['User Retention Rate (%)', userMetrics.user_retention_rate || 0]
      ];
      
      // Add users by role
      if (userMetrics.users_by_role && Object.keys(userMetrics.users_by_role).length > 0) {
        userData.push(['', '']);
        userData.push(['Users by Role', '']);
        userData.push(['Role', 'Count']);
        Object.entries(userMetrics.users_by_role).forEach(([role, count]) => {
          userData.push([role, count]);
        });
      }
      
      // Add top users by spending
      if (userMetrics.top_users_by_spending && userMetrics.top_users_by_spending.length > 0) {
        userData.push(['', '']);
        userData.push(['Top Users by Spending', '']);
        userData.push(['Name', 'Email', 'Total Spent', 'Total Transactions']);
        userMetrics.top_users_by_spending.forEach(user => {
          userData.push([user.name, user.email, user.total_spent, user.total_transactions]);
        });
      }
      
      const userSheet = XLSX.utils.aoa_to_sheet(userData);
      XLSX.utils.book_append_sheet(workbook, userSheet, 'User Metrics');
    }
    
    // Raffle Metrics Sheet
    if (raffleMetrics) {
      const raffleData = [
        ['Metric', 'Value'],
        ['Total Raffles', raffleMetrics.total_raffles || 0],
        ['Active Raffles', raffleMetrics.active_raffles || 0],
        ['Completed Raffles', raffleMetrics.completed_raffles || 0],
        ['New Raffles', raffleMetrics.new_raffles || 0],
        ['Average Participation', raffleMetrics.avg_participation || 0],
        ['Completion Rate (%)', raffleMetrics.completion_rate || 0],
        ['Total Tickets Sold', raffleMetrics.total_tickets_sold || 0]
      ];
      
      // Add raffles by category
      if (raffleMetrics.raffles_by_category && Object.keys(raffleMetrics.raffles_by_category).length > 0) {
        raffleData.push(['', '']);
        raffleData.push(['Raffles by Category', '']);
        raffleData.push(['Category', 'Count']);
        Object.entries(raffleMetrics.raffles_by_category).forEach(([category, count]) => {
          raffleData.push([category, count]);
        });
      }
      
      // Add top raffles by revenue
      if (raffleMetrics.top_raffles_by_revenue && raffleMetrics.top_raffles_by_revenue.length > 0) {
        raffleData.push(['', '']);
        raffleData.push(['Top Raffles by Revenue', '']);
        raffleData.push(['Title', 'Ticket Price', 'Tickets Sold', 'Total Revenue', 'Total Transactions']);
        raffleMetrics.top_raffles_by_revenue.forEach(raffle => {
          raffleData.push([raffle.title, raffle.ticket_price, raffle.tickets_sold, raffle.total_revenue, raffle.total_transactions]);
        });
      }
      
      // Add raffle performance
      if (raffleMetrics.raffle_performance) {
        raffleData.push(['', '']);
        raffleData.push(['Raffle Performance', '']);
        raffleData.push(['Metric', 'Value']);
        raffleData.push(['Total Created', raffleMetrics.raffle_performance.total_created || 0]);
        raffleData.push(['Fully Sold', raffleMetrics.raffle_performance.fully_sold || 0]);
        raffleData.push(['Average Fill Rate (%)', raffleMetrics.raffle_performance.average_fill_rate || 0]);
        raffleData.push(['Average Duration (days)', raffleMetrics.raffle_performance.average_duration || 0]);
      }
      
      const raffleSheet = XLSX.utils.aoa_to_sheet(raffleData);
      XLSX.utils.book_append_sheet(workbook, raffleSheet, 'Raffle Metrics');
    }
    
    // Save the Excel file
    XLSX.writeFile(workbook, `reports-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToJSON = () => {
    const data = {
      financial: reportData,
      users: userMetrics,
      raffles: raffleMetrics,
      exportDate: new Date().toISOString(),
      period: period
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart data for revenue trend
  const revenueChartData = {
    labels: reportData?.transaction_trends?.map(t => {
      const date = new Date(t.date);
      return date.toLocaleDateString();
    }) || [],
    datasets: [
      {
        label: 'Revenue',
        data: reportData?.transaction_trends?.map(t => Number(t.revenue || 0)) || [],
        backgroundColor: 'rgba(148, 163, 184, 0.6)',
        borderColor: 'rgb(100, 116, 139)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Reports</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchReportData()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle render errors
  if (hasRenderError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Component Error</h2>
          <p className="text-red-600 mb-4">Something went wrong while rendering the reports data.</p>
          <button
            onClick={() => {
              setHasRenderError(false);
              fetchReportData();
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Reports Dashboard</h1>
              <p className="text-slate-600 mt-2">Comprehensive reports and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={() => fetchReportData(true)}
                disabled={refreshing}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="relative export-dropdown">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-10 export-dropdown">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          exportToPDF();
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                      >
                        <File className="h-4 w-4" />
                        <span>Export as PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          exportToExcel();
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Export as Excel</span>
                      </button>
                      <button
                        onClick={() => {
                          exportToJSON();
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Export as JSON</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('financial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'financial'
                  ? 'border-slate-600 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Financial Reports
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-slate-600 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              User Reports
            </button>
            <button
              onClick={() => setActiveTab('raffles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'raffles'
                  ? 'border-slate-600 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Raffle Reports
            </button>
          </nav>
        </div>

        {/* Financial Reports Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg shadow-sm border border-emerald-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-800">
                      ${reportData?.total_revenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {reportData?.total_transactions || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {reportData?.success_rate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Avg Transaction</p>
                    <p className="text-2xl font-bold text-amber-800">
                      ${reportData?.avg_transaction_value?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Revenue Trends Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Revenue Trends</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {reportData?.transaction_trends?.map((trend, index) => {
                      const prevTrend = reportData.transaction_trends[index - 1];
                      const currentRevenue = Number(trend.revenue || 0);
                      const prevRevenue = Number(prevTrend?.revenue || 0);
                      const growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100) : 0;
                      
                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(trend.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {trend.transactions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            ${currentRevenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                              {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Payment Methods Performance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Successful</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Failed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Success Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {Object.entries(reportData?.payment_methods || {}).map(([method, data]) => {
                      // Add safety checks for payment method data
                      const safeData = {
                        count: data?.count || 0,
                        revenue: Number(data?.revenue || 0),
                        successful_count: data?.successful_count || 0,
                        failed_count: data?.failed_count || 0,
                        avg_amount: Number(data?.avg_amount || 0),
                        success_rate: Number(data?.success_rate || 0)
                      };
                      
                      return (
                        <tr key={method} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 capitalize">
                            <div className="flex items-center">
                              <span className="inline-block w-3 h-3 rounded-full bg-slate-300 mr-2"></span>
                              {method}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {safeData.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {safeData.successful_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {safeData.failed_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              safeData.success_rate >= 90 ? 'bg-green-100 text-green-800' :
                              safeData.success_rate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {safeData.success_rate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            ${safeData.revenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            ${safeData.avg_amount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Small Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Revenue Overview</h2>
              <div className="h-64">
                <Bar data={revenueChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* User Reports Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Users</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {userMetrics?.total_users || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active Users</p>
                    <p className="text-2xl font-bold text-green-800">
                      {userMetrics?.active_users || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">New Today</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {userMetrics?.new_users_today || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Growth Rate</p>
                    <p className="text-2xl font-bold text-amber-800">
                      {userMetrics?.user_growth_rate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>

            {/* User Activity Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">User Activity Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Total Registered Users</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.total_users || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Active Users (Last 30 Days)</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.active_users || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">New Users Today</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.new_users_today || 0}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">User Growth Rate</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.user_growth_rate?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">User Retention Rate</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.user_retention_rate?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">New Users in Period</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.new_users || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Users by Spending */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Top Users by Spending</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg per Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {userMetrics?.top_users_by_spending?.map((user, index) => (
                      <tr key={user.user_id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          #{index + 1} {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${Number(user.total_spent).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {user.total_transactions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${(Number(user.total_spent) / user.total_transactions).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Users by Role */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Users by Role</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(userMetrics?.users_by_role || {}).map(([role, count]) => (
                  <div key={role} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700 capitalize">{role}</p>
                      <p className="text-2xl font-bold text-slate-800">{count}</p>
                      <p className="text-xs text-slate-500">
                        {userMetrics?.total_users && userMetrics.total_users > 0 ? 
                          ((count / userMetrics.total_users) * 100).toFixed(1) : '0.0'}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Raffle Reports Tab */}
        {activeTab === 'raffles' && (
          <div className="space-y-6">
            {/* Raffle KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg shadow-sm border border-indigo-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Total Raffles</p>
                    <p className="text-2xl font-bold text-indigo-800">
                      {raffleMetrics?.total_raffles || 0}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-indigo-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg shadow-sm border border-emerald-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Active Raffles</p>
                    <p className="text-2xl font-bold text-emerald-800">
                      {raffleMetrics?.active_raffles || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-emerald-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Completed</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {raffleMetrics?.completed_raffles || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-slate-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Fill Rate</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {raffleMetrics?.raffle_performance?.average_fill_rate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Top Raffles by Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Top Raffles by Revenue</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Raffle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ticket Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tickets Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {raffleMetrics?.top_raffles_by_revenue?.map((raffle, index) => (
                      <tr key={raffle.raffle_id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          #{index + 1} {raffle.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${Number(raffle.ticket_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {raffle.tickets_sold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${Number(raffle.total_revenue).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {raffle.total_transactions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Raffle Performance Details */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Raffle Performance Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Total Tickets Sold</span>
                    <span className="font-semibold text-slate-900">{raffleMetrics?.total_tickets_sold || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Average Fill Rate</span>
                    <span className="font-semibold text-slate-900">{raffleMetrics?.raffle_performance?.average_fill_rate?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Completion Rate</span>
                    <span className="font-semibold text-slate-900">{raffleMetrics?.completion_rate?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">New Raffles in Period</span>
                    <span className="font-semibold text-slate-900">{raffleMetrics?.new_raffles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Fully Sold Raffles</span>
                    <span className="font-semibold text-slate-900">{raffleMetrics?.raffle_performance?.fully_sold || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Average Duration (Days)</span>
                    <span className="font-semibold text-slate-900">{raffleMetrics?.raffle_performance?.average_duration?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raffles by Category */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Raffles by Category</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Raffles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Percentage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {Object.entries(raffleMetrics?.raffles_by_category || {})
                      .sort(([, a], [, b]) => b - a) // Sort by count descending
                      .map(([category, count]) => {
                        const percentage = raffleMetrics?.total_raffles && raffleMetrics.total_raffles > 0 ? 
                          ((count / raffleMetrics.total_raffles) * 100) : 0;
                        return (
                          <tr key={category} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              <div className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full bg-indigo-300 mr-2"></span>
                                {category || 'Uncategorized'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className="font-semibold">{count}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                {percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <div className="flex items-center">
                                <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-500 w-12 text-right">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  } catch (renderError) {
    console.error('Reports render error:', renderError);
    // Set error state to trigger error UI on next render
    setTimeout(() => setHasRenderError(true), 0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Loading Error</h2>
          <p className="text-red-600 mb-4">Something went wrong while loading the reports.</p>
        </div>
      </div>
    );
  }
};

export default Reports;