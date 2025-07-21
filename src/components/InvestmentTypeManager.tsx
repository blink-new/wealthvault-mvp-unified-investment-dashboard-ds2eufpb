import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Plus, 
  Settings, 
  TrendingUp, 
  Heart, 
  Shield, 
  User, 
  Building, 
  Coins, 
  PiggyBank, 
  Landmark,
  X,
  Check
} from 'lucide-react'

export interface InvestmentType {
  id: string
  name: string
  category: 'Insurance' | 'Investment' | 'Retirement' | 'Health' | 'Custom'
  icon: string
  color: string
  isDefault: boolean
  isActive: boolean
}

const defaultTypes: InvestmentType[] = [
  { id: 'lic', name: 'LIC', category: 'Insurance', icon: 'TrendingUp', color: 'blue', isDefault: true, isActive: true },
  { id: 'mediclaim', name: 'Mediclaim', category: 'Health', icon: 'Heart', color: 'red', isDefault: true, isActive: true },
  { id: 'term', name: 'Term Insurance', category: 'Insurance', icon: 'Shield', color: 'green', isDefault: true, isActive: true },
  { id: 'nps', name: 'NPS', category: 'Retirement', icon: 'User', color: 'purple', isDefault: true, isActive: true },
  { id: 'ppf', name: 'PPF', category: 'Investment', icon: 'PiggyBank', color: 'yellow', isDefault: false, isActive: true },
  { id: 'epf', name: 'EPF', category: 'Retirement', icon: 'Building', color: 'indigo', isDefault: false, isActive: true },
  { id: 'mutual_funds', name: 'Mutual Funds', category: 'Investment', icon: 'TrendingUp', color: 'green', isDefault: false, isActive: true },
  { id: 'stocks', name: 'Stocks', category: 'Investment', icon: 'Coins', color: 'blue', isDefault: false, isActive: true },
  { id: 'bonds', name: 'Bonds', category: 'Investment', icon: 'Landmark', color: 'gray', isDefault: false, isActive: true },
  { id: 'fd', name: 'Fixed Deposit', category: 'Investment', icon: 'PiggyBank', color: 'orange', isDefault: false, isActive: true }
]

interface InvestmentTypeManagerProps {
  selectedTypes: InvestmentType[]
  onTypesChange: (types: InvestmentType[]) => void
}

export const InvestmentTypeManager: React.FC<InvestmentTypeManagerProps> = ({
  selectedTypes,
  onTypesChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [types, setTypes] = useState<InvestmentType[]>(defaultTypes)
  const [newType, setNewType] = useState({
    name: '',
    category: 'Custom' as InvestmentType['category'],
    icon: 'TrendingUp',
    color: 'blue'
  })
  const [isAddingNew, setIsAddingNew] = useState(false)

  const iconOptions = [
    { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
    { value: 'Heart', label: 'Heart', icon: Heart },
    { value: 'Shield', label: 'Shield', icon: Shield },
    { value: 'User', label: 'User', icon: User },
    { value: 'Building', label: 'Building', icon: Building },
    { value: 'Coins', label: 'Coins', icon: Coins },
    { value: 'PiggyBank', label: 'Piggy Bank', icon: PiggyBank },
    { value: 'Landmark', label: 'Landmark', icon: Landmark }
  ]

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-500' }
  ]

  const getIcon = (iconName: string) => {
    const IconComponent = iconOptions.find(opt => opt.value === iconName)?.icon || TrendingUp
    return <IconComponent className="h-4 w-4" />
  }

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color)
    return colorOption?.class || 'bg-blue-500'
  }

  const handleToggleType = (typeId: string) => {
    const updatedTypes = types.map(type =>
      type.id === typeId ? { ...type, isActive: !type.isActive } : type
    )
    setTypes(updatedTypes)
    onTypesChange(updatedTypes.filter(type => type.isActive))
  }

  const handleAddNewType = () => {
    if (!newType.name.trim()) return

    const newTypeObj: InvestmentType = {
      id: newType.name.toLowerCase().replace(/\s+/g, '_'),
      name: newType.name,
      category: newType.category,
      icon: newType.icon,
      color: newType.color,
      isDefault: false,
      isActive: true
    }

    const updatedTypes = [...types, newTypeObj]
    setTypes(updatedTypes)
    onTypesChange(updatedTypes.filter(type => type.isActive))
    
    setNewType({ name: '', category: 'Custom', icon: 'TrendingUp', color: 'blue' })
    setIsAddingNew(false)
  }

  const handleRemoveCustomType = (typeId: string) => {
    const updatedTypes = types.filter(type => type.id !== typeId)
    setTypes(updatedTypes)
    onTypesChange(updatedTypes.filter(type => type.isActive))
  }

  const groupedTypes = types.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = []
    }
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, InvestmentType[]>)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Types
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Investment Types</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Types Summary */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-2">
              Active Types ({types.filter(t => t.isActive).length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {types.filter(t => t.isActive).map(type => (
                <Badge key={type.id} className={`${getColorClass(type.color)} text-white`}>
                  {getIcon(type.icon)}
                  <span className="ml-1">{type.name}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Investment Type Categories */}
          {Object.entries(groupedTypes).map(([category, categoryTypes]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-medium text-slate-900">{category}</h3>
              <div className="grid grid-cols-1 gap-2">
                {categoryTypes.map(type => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${getColorClass(type.color)} rounded-lg flex items-center justify-center text-white`}>
                        {getIcon(type.icon)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{type.name}</p>
                        {type.isDefault && (
                          <p className="text-xs text-slate-500">Default type</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={type.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleType(type.id)}
                        className={type.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {type.isActive ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          'Enable'
                        )}
                      </Button>
                      
                      {!type.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomType(type.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add New Type */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Add Custom Type</h3>
              {!isAddingNew && (
                <Button onClick={() => setIsAddingNew(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              )}
            </div>

            {isAddingNew && (
              <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
                <div>
                  <Label htmlFor="typeName">Type Name</Label>
                  <Input
                    id="typeName"
                    value={newType.name}
                    onChange={(e) => setNewType(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Crypto, Real Estate, Gold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newType.category} 
                      onValueChange={(value) => setNewType(prev => ({ ...prev, category: value as InvestmentType['category'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Retirement">Retirement</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select 
                      value={newType.icon} 
                      onValueChange={(value) => setNewType(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <option.icon className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Select 
                      value={newType.color} 
                      onValueChange={(value) => setNewType(prev => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 ${option.class} rounded`} />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingNew(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddNewType}
                    disabled={!newType.name.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Type
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}