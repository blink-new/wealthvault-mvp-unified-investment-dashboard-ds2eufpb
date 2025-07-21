import { useState, useEffect, useCallback } from 'react'
import { blink } from './blink/client'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { FileUpload } from './components/FileUpload'
import { EditInvestmentModal } from './components/EditInvestmentModal'
import { GuardianView } from './components/GuardianView'
import { InvestmentTypeManager, type InvestmentType } from './components/InvestmentTypeManager'
import { extractDataFromDocument, type ExtractedData } from './services/ocrService'
import { 
  Plus, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  FileText, 
  Share2,
  Filter,
  Eye,
  Edit,
  Clock,
  Shield,
  Heart,
  TrendingUp,
  User,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react'

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

// Mock data for demo purposes
const getMockInvestments = (userId: string): Investment[] => [
  {
    id: '1',
    userId,
    type: 'LIC',
    name: 'Jeevan Anand',
    policyNumber: 'LIC123456789',
    premium: 25000,
    frequency: 'Yearly',
    nextDue: '2025-08-10',
    maturity: '2040-08-10',
    nominee: 'Mother',
    status: 'active',
    coverage: 500000,
    documents: ['policy.pdf'],
    passwordProtected: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    userId,
    type: 'Mediclaim',
    name: 'Star Health',
    policyNumber: 'SH987654321',
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
  },
  {
    id: '3',
    userId,
    type: 'Term',
    name: 'HDFC Click2Protect',
    policyNumber: 'HDFC456789123',
    premium: 12000,
    frequency: 'Yearly',
    nextDue: '2026-01-01',
    maturity: '2046-01-01',
    nominee: 'Father',
    status: 'active',
    coverage: 1000000,
    documents: ['term_policy.pdf'],
    passwordProtected: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'attention' | 'expired'>('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [guardianModalOpen, setGuardianModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [selectedType, setSelectedType] = useState<string>('')
  const [isProcessingUpload, setIsProcessingUpload] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [showGuardianView, setShowGuardianView] = useState(false)
  const [guardianShareLink, setGuardianShareLink] = useState<string>('')
  const [availableTypes, setAvailableTypes] = useState<InvestmentType[]>([])
  const [uploadFormData, setUploadFormData] = useState({
    password: '',
    nominee: '',
    maturity: ''
  })

  // Authentication and data loading
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadInvestments = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await blink.db.investments.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      // If no data exists, seed with mock data for demo
      if (data.length === 0) {
        const mockData = getMockInvestments(user.id)
        for (const investment of mockData) {
          await blink.db.investments.create({
            id: investment.id,
            userId: investment.userId,
            type: investment.type,
            name: investment.name,
            policyNumber: investment.policyNumber,
            premium: investment.premium,
            frequency: investment.frequency,
            nextDue: investment.nextDue,
            maturity: investment.maturity,
            nominee: investment.nominee,
            status: investment.status,
            coverage: investment.coverage,
            documents: JSON.stringify(investment.documents),
            passwordProtected: investment.passwordProtected ? "1" : "0"
          })
        }
        setInvestments(mockData)
      } else {
        // Transform database data to frontend format
        const transformedData = data.map(item => ({
          id: item.id,
          userId: item.userId,
          type: item.type as Investment['type'],
          name: item.name,
          policyNumber: item.policyNumber || '',
          premium: item.premium || 0,
          frequency: item.frequency as Investment['frequency'],
          nextDue: item.nextDue || '',
          maturity: item.maturity || '',
          nominee: item.nominee || '',
          status: item.status as Investment['status'],
          coverage: item.coverage || 0,
          documents: item.documents ? JSON.parse(item.documents) : [],
          passwordProtected: Number(item.passwordProtected) > 0,
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || ''
        }))
        setInvestments(transformedData)
      }
    } catch (error) {
      console.error('Failed to load investments:', error)
    }
  }, [user?.id])

  // Load investments when user is authenticated
  useEffect(() => {
    if (user?.id) {
      loadInvestments()
    }
  }, [user?.id, loadInvestments])

  // Handle file upload with OCR
  const handleFileUpload = async (file: File) => {
    setIsProcessingUpload(true)
    try {
      const data = await extractDataFromDocument(file)
      setExtractedData(data)
      
      // Pre-fill form with extracted data
      setUploadFormData(prev => ({
        ...prev,
        nominee: data.nominee || prev.nominee,
        maturity: data.maturity || prev.maturity
      }))
    } catch (error) {
      console.error('OCR extraction failed:', error)
      // Continue with manual entry
    } finally {
      setIsProcessingUpload(false)
    }
  }

  // Save new investment
  const handleSaveInvestment = async () => {
    if (!user?.id || !selectedType || !extractedData) return

    try {
      const newInvestment = {
        id: `inv_${Date.now()}`,
        userId: user.id,
        type: selectedType,
        name: extractedData.policyName || extractedData.companyName || 'New Investment',
        policyNumber: extractedData.policyNumber || '',
        premium: extractedData.premium || 0,
        frequency: extractedData.frequency || 'Yearly',
        nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        maturity: uploadFormData.maturity || extractedData.maturity || '',
        nominee: uploadFormData.nominee || extractedData.nominee || '',
        status: 'active' as const,
        coverage: extractedData.coverage || 0,
        documents: JSON.stringify([]),
        passwordProtected: uploadFormData.password ? "1" : "0"
      }

      await blink.db.investments.create(newInvestment)
      await loadInvestments()
      
      // Reset form
      setUploadModalOpen(false)
      setExtractedData(null)
      setSelectedType('')
      setUploadFormData({ password: '', nominee: '', maturity: '' })
    } catch (error) {
      console.error('Failed to save investment:', error)
    }
  }

  // Edit investment
  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment)
    setEditModalOpen(true)
  }

  // Save edited investment
  const handleSaveEditedInvestment = async (investment: Investment) => {
    try {
      await blink.db.investments.update(investment.id, {
        type: investment.type,
        name: investment.name,
        policyNumber: investment.policyNumber,
        premium: investment.premium,
        frequency: investment.frequency,
        nextDue: investment.nextDue,
        maturity: investment.maturity,
        nominee: investment.nominee,
        status: investment.status,
        coverage: investment.coverage,
        passwordProtected: investment.passwordProtected ? "1" : "0"
      })
      
      await loadInvestments()
      setEditModalOpen(false)
      setSelectedInvestment(null)
    } catch (error) {
      console.error('Failed to update investment:', error)
    }
  }

  // Generate Guardian View link
  const handleGenerateGuardianLink = () => {
    // In a real implementation, you'd generate a secure token and store sharing preferences
    const token = btoa(`${user.id}_${Date.now()}_guardian`)
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}?guardian=true&token=${token}`
    setGuardianShareLink(shareUrl)
  }

  // Copy Guardian link to clipboard
  const handleCopyGuardianLink = async () => {
    try {
      await navigator.clipboard.writeText(guardianShareLink)
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">WealthVault</h1>
          <p className="text-slate-600">Loading your investment portfolio...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">WealthVault</h1>
          <p className="text-slate-600 mb-6">A Single Screen That Remembers What You Forgot</p>
          <Button 
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  const filteredInvestments = investments.filter(inv => {
    if (filter === 'all') return true
    return inv.status === filter
  })

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

  const attentionCount = investments.filter(inv => inv.status === 'attention').length

  // Check if we're in Guardian View mode
  const urlParams = new URLSearchParams(window.location.search)
  const isGuardianMode = urlParams.get('guardian') === 'true'
  
  if (isGuardianMode) {
    return <GuardianView />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">WealthVault</h1>
            <span className="text-sm text-slate-500">MVP</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <InvestmentTypeManager 
              selectedTypes={availableTypes}
              onTypesChange={setAvailableTypes}
            />
            
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Investment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Investment Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTypes.filter(type => type.isActive).map(type => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                        {availableTypes.length === 0 && (
                          <>
                            <SelectItem value="LIC">LIC</SelectItem>
                            <SelectItem value="Mediclaim">Mediclaim</SelectItem>
                            <SelectItem value="Term">Term Insurance</SelectItem>
                            <SelectItem value="NPS">NPS</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <FileUpload 
                    onFileSelect={handleFileUpload}
                    acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                    maxSize={10}
                  />

                  {extractedData && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Data Extracted Successfully!</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {extractedData.policyNumber && (
                          <div><span className="font-medium">Policy:</span> {extractedData.policyNumber}</div>
                        )}
                        {extractedData.premium && (
                          <div><span className="font-medium">Premium:</span> ₹{extractedData.premium.toLocaleString()}</div>
                        )}
                        {extractedData.coverage && (
                          <div><span className="font-medium">Coverage:</span> ₹{extractedData.coverage.toLocaleString()}</div>
                        )}
                        {extractedData.nominee && (
                          <div><span className="font-medium">Nominee:</span> {extractedData.nominee}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="password">Document Password (Optional)</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter if document is locked"
                      value={uploadFormData.password}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nominee">Nominee (Optional)</Label>
                    <Input 
                      id="nominee" 
                      placeholder="Enter nominee name"
                      value={uploadFormData.nominee}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, nominee: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maturity">Maturity Date (Optional)</Label>
                    <Input 
                      id="maturity" 
                      type="date"
                      value={uploadFormData.maturity}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, maturity: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveInvestment}
                    disabled={!selectedType || (!extractedData && !uploadFormData.nominee)}
                  >
                    {isProcessingUpload ? 'Processing...' : 'Save Investment'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={guardianModalOpen} onOpenChange={setGuardianModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Guardian View
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Guardian View</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Generate a read-only link for family members to view your investment details.
                  </p>
                  
                  <div>
                    <Label>Select what to include:</Label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">All investments</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Policy details</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Maturity dates</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span className="text-sm">Documents</span>
                      </label>
                    </div>
                  </div>

                  {guardianShareLink ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">✅ Guardian Link Generated!</p>
                        <div className="flex items-center space-x-2">
                          <Input 
                            value={guardianShareLink} 
                            readOnly 
                            className="text-xs"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleCopyGuardianLink}
                            variant="outline"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(guardianShareLink, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          onClick={() => setGuardianShareLink('')}
                          variant="outline"
                          className="flex-1"
                        >
                          Generate New
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleGenerateGuardianLink}
                    >
                      Generate Guardian Link
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Missing Info Alert */}
        {attentionCount > 0 && (
          <div className="mb-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      {attentionCount} investment{attentionCount > 1 ? 's' : ''} need{attentionCount === 1 ? 's' : ''} attention
                    </p>
                    <p className="text-sm text-yellow-700">Missing documents, nominee details, or other information</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilter('attention')}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Review Now
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
          </div>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: investments.length },
              { key: 'active', label: 'Active', count: investments.filter(i => i.status === 'active').length },
              { key: 'attention', label: 'Attention', count: investments.filter(i => i.status === 'attention').length },
              { key: 'expired', label: 'Expired', count: investments.filter(i => i.status === 'expired').length }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key as any)}
                className={filter === key ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {label} ({count})
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Investment Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Investment Portfolio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name/Policy</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Maturity</TableHead>
                      <TableHead>Nominee</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestments.map((investment) => (
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
                            <p className="text-sm text-slate-500">{investment.policyNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{new Date(investment.nextDue).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{investment.maturity}</TableCell>
                        <TableCell>{investment.nominee}</TableCell>
                        <TableCell>₹{investment.coverage.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(investment.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditInvestment(investment)}
                              title="Edit Investment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            {/* Timeline View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Upcoming Events</span>
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Investment Modal */}
      <EditInvestmentModal
        investment={selectedInvestment}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedInvestment(null)
        }}
        onSave={handleSaveEditedInvestment}
      />
    </div>
  )
}

export default App