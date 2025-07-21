import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Calendar, Save, X, AlertTriangle } from 'lucide-react'

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

interface EditInvestmentModalProps {
  investment: Investment | null
  isOpen: boolean
  onClose: () => void
  onSave: (investment: Investment) => Promise<void>
}

export const EditInvestmentModal: React.FC<EditInvestmentModalProps> = ({
  investment,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Investment>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (investment) {
      setFormData({ ...investment })
      setErrors({})
    }
  }, [investment])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Investment name is required'
    }
    if (!formData.policyNumber?.trim()) {
      newErrors.policyNumber = 'Policy number is required'
    }
    if (!formData.premium || formData.premium <= 0) {
      newErrors.premium = 'Premium amount must be greater than 0'
    }
    if (!formData.coverage || formData.coverage <= 0) {
      newErrors.coverage = 'Coverage amount must be greater than 0'
    }
    if (!formData.nextDue) {
      newErrors.nextDue = 'Next due date is required'
    }
    if (!formData.maturity) {
      newErrors.maturity = 'Maturity date is required'
    }
    if (!formData.nominee?.trim()) {
      newErrors.nominee = 'Nominee is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !investment) return

    setIsSaving(true)
    try {
      const updatedInvestment: Investment = {
        ...investment,
        ...formData,
        updatedAt: new Date().toISOString()
      } as Investment

      await onSave(updatedInvestment)
      onClose()
    } catch (error) {
      console.error('Failed to save investment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Investment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'attention': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!investment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Investment</span>
            <Badge className={getStatusColor(formData.status || 'active')}>
              {formData.status === 'active' && '✅ Active'}
              {formData.status === 'attention' && '⚠️ Attention Needed'}
              {formData.status === 'expired' && '❌ Expired'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Investment Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIC">LIC</SelectItem>
                    <SelectItem value="Mediclaim">Mediclaim</SelectItem>
                    <SelectItem value="Term">Term Insurance</SelectItem>
                    <SelectItem value="NPS">NPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">✅ Active</SelectItem>
                    <SelectItem value="attention">⚠️ Attention Needed</SelectItem>
                    <SelectItem value="expired">❌ Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Investment Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Jeevan Anand, Star Health"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input
                id="policyNumber"
                value={formData.policyNumber || ''}
                onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                placeholder="Enter policy number"
                className={errors.policyNumber ? 'border-red-500' : ''}
              />
              {errors.policyNumber && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.policyNumber}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Financial Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="premium">Premium Amount (₹)</Label>
                <Input
                  id="premium"
                  type="number"
                  value={formData.premium || ''}
                  onChange={(e) => handleInputChange('premium', Number(e.target.value))}
                  placeholder="25000"
                  className={errors.premium ? 'border-red-500' : ''}
                />
                {errors.premium && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.premium}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="frequency">Payment Frequency</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value) => handleInputChange('frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="coverage">Coverage Amount (₹)</Label>
              <Input
                id="coverage"
                type="number"
                value={formData.coverage || ''}
                onChange={(e) => handleInputChange('coverage', Number(e.target.value))}
                placeholder="500000"
                className={errors.coverage ? 'border-red-500' : ''}
              />
              {errors.coverage && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.coverage}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Important Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Important Dates
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nextDue">Next Due Date</Label>
                <Input
                  id="nextDue"
                  type="date"
                  value={formData.nextDue || ''}
                  onChange={(e) => handleInputChange('nextDue', e.target.value)}
                  className={errors.nextDue ? 'border-red-500' : ''}
                />
                {errors.nextDue && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.nextDue}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="maturity">Maturity Date</Label>
                <Input
                  id="maturity"
                  type="date"
                  value={formData.maturity || ''}
                  onChange={(e) => handleInputChange('maturity', e.target.value)}
                  className={errors.maturity ? 'border-red-500' : ''}
                />
                {errors.maturity && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.maturity}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Nominee Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Nominee Information</h3>
            
            <div>
              <Label htmlFor="nominee">Nominee Name</Label>
              <Input
                id="nominee"
                value={formData.nominee || ''}
                onChange={(e) => handleInputChange('nominee', e.target.value)}
                placeholder="Enter nominee name"
                className={errors.nominee ? 'border-red-500' : ''}
              />
              {errors.nominee && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.nominee}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}