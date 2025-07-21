import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  Shield, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Heart, 
  User, 
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import { blink } from '../blink/client'

interface Investment {
  id: string
  userId: string
  type: 'LIC' | 'Mediclaim' | 'Term' | 'NPS'
  name: string
  policyNumber: string
  premium: number
  frequency: 'Monthly' | 'Quarterly' | 'Yearly'
  nextDue: string
  maturity: string
  nominee: string
  status: 'active' | 'attention' | 'expired'
  coverage: number
  documents: string[]
  passwordProtected: boolean
  createdAt: string
  updatedAt: string
}

interface GuardianViewProps {
  shareToken?: string
  onBack?: () => void
}

export const GuardianView: React.FC<GuardianViewProps> = ({ shareToken, onBack }) => {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareConfig, setShareConfig] = useState({
    includeAll: true,
    includePolicyDetails: true,
    includeMaturityDates: true,
    includeDocuments: false
  })

  const token = shareToken || new URLSearchParams(window.location.search).get('token')

  const loadGuardianData = async () => {
    if (!token) {
      setError('Invalid or missing share token')
      setLoading(false)
      return
    }

    try {
      // In a real implementation, you'd validate the token and fetch shared data
      // For now, we'll simulate loading shared data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock shared data - in reality this would come from the token
      const mockSharedData: Investment[] = [
        {
          id: '1',
          userId: 'shared-user',
          type: 'LIC',
          name: 'Jeevan Anand',
          policyNumber: 'LIC***6789',
          premium: 25000,
          frequency: 'Yearly',
          nextDue: '2025-08-10',
          maturity: '2040-08-10',
          nominee: 'Mother',
          status: 'active',
          coverage: 500000,
          documents: [],
          passwordProtected: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'shared-user',
          type: 'Mediclaim',
          name: 'Star Health',
          policyNumber: 'SH***4321',
          premium: 15000,
          frequency: 'Yearly',
          nextDue: '2025-09-12',
          maturity: 'Yearly',
          nominee: 'Self',
          status: 'attention',
          coverage: 300000,
          documents: [],
          passwordProtected: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      setInvestments(mockSharedData)
    } catch (error) {
      setError('Failed to load shared investment data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuardianData()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'attention': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'expired': return <XCircle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Active</Badge>
      case 'attention': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">⚠️ Attention Needed</Badge>
      case 'expired': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">❌ Expired</Badge>
      default: return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LIC': return <TrendingUp className="h-4 w-4" />
      case 'Mediclaim': return <Heart className="h-4 w-4" />
      case 'Term': return <Shield className="h-4 w-4" />
      case 'NPS': return <User className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Guardian View</h1>
          <p className="text-slate-600">Loading shared investment data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-7 w-7 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Guardian View</h1>
              <p className="text-sm text-slate-500">Read-only access to investment portfolio</p>
            </div>
          </div>
          
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Investments</p>
                  <p className="text-2xl font-bold text-slate-900">{investments.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Policies</p>
                  <p className="text-2xl font-bold text-green-600">
                    {investments.filter(i => i.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Need Attention</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {investments.filter(i => i.status === 'attention').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Coverage</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{investments.reduce((sum, inv) => sum + inv.coverage, 0).toLocaleString()}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Portfolio Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Investment Portfolio</span>
              <Badge variant="outline" className="ml-auto">Read-Only</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name/Policy</TableHead>
                  {shareConfig.includeMaturityDates && <TableHead>Next Due</TableHead>}
                  {shareConfig.includeMaturityDates && <TableHead>Maturity</TableHead>}
                  <TableHead>Nominee</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(investment.type)}
                        <span className="font-medium">{investment.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{investment.name}</p>
                        {shareConfig.includePolicyDetails && (
                          <p className="text-sm text-slate-500">{investment.policyNumber}</p>
                        )}
                      </div>
                    </TableCell>
                    {shareConfig.includeMaturityDates && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{new Date(investment.nextDue).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                    )}
                    {shareConfig.includeMaturityDates && (
                      <TableCell>{investment.maturity}</TableCell>
                    )}
                    <TableCell>{investment.nominee}</TableCell>
                    <TableCell>₹{investment.coverage.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(investment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Premium Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments
                .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())
                .map((investment) => (
                  <div key={investment.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(investment.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(investment.type)}
                        <span className="font-medium">{investment.name}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Premium due: {new Date(investment.nextDue).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{investment.premium.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">{investment.frequency}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This is a read-only view shared via WealthVault Guardian Access</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  )
}