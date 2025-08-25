import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertTriangle, Phone, User } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface EmergencyOrderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmergencyRequestData) => void;
  orderId?: string;
  isExistingOrder?: boolean;
}

interface EmergencyRequestData {
  reason: string;
  urgencyLevel: 'high' | 'critical' | 'life_threatening';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  additionalNotes?: string;
}

const EmergencyOrderRequestModal: React.FC<EmergencyOrderRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  isExistingOrder = false
}) => {
  const [formData, setFormData] = useState<EmergencyRequestData>({
    reason: '',
    urgencyLevel: 'high',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        emergencyContact: includeEmergencyContact ? formData.emergencyContact : undefined
      };
      
      await onSubmit(submitData);
      onClose();
      
      // Reset form
      setFormData({
        reason: '',
        urgencyLevel: 'high',
        emergencyContact: { name: '', phone: '', relationship: '' },
        additionalNotes: ''
      });
      setIncludeEmergencyContact(false);
    } catch (error) {
      console.error('Error submitting emergency request:', error);
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { value: 'high', label: 'High Priority', description: 'Important but not life-threatening' },
    { value: 'critical', label: 'Critical', description: 'Urgent medical or safety need' },
    { value: 'life_threatening', label: 'Life Threatening', description: 'Immediate medical emergency' }
  ];

  const relationshipOptions = [
    'Family Member', 'Friend', 'Caregiver', 'Medical Professional', 'Emergency Contact', 'Other'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>
              {isExistingOrder ? 'Mark Order as Emergency' : 'Request Emergency Delivery'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isExistingOrder 
              ? `Request emergency priority for order ${orderId}. This will expedite your delivery.`
              : 'Request a new emergency priority delivery. Emergency orders receive highest priority and fastest delivery.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-800">
              Emergency requests are reviewed by our team. False emergency claims may result in account restrictions.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Emergency Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please describe why this is an emergency (e.g., medical emergency, urgent medication needed, etc.)"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="urgencyLevel">Urgency Level *</Label>
              <Select 
                value={formData.urgencyLevel} 
                onValueChange={(value: 'high' | 'critical' | 'life_threatening') => 
                  setFormData({ ...formData, urgencyLevel: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeContact"
                checked={includeEmergencyContact}
                onChange={(e) => setIncludeEmergencyContact(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeContact">Add emergency contact for updates</Label>
            </div>

            {includeEmergencyContact && (
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Emergency Contact Information</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      placeholder="Full name"
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact!, name: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact!, phone: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select 
                    value={formData.emergencyContact?.relationship || ''} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact!, relationship: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional information that might help us prioritize your request"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Submitting...' : 'Submit Emergency Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyOrderRequestModal;
