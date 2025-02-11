import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Language } from "@/lib/translations";

interface OrderDialogProps {
  showContactModal: boolean;
  setShowContactModal: (show: boolean) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  handleCompleteOrder: () => void;
  isLoading: boolean;
  language: Language;
  translations: any;
}

export function OrderDialog({
  showContactModal,
  setShowContactModal,
  customerName,
  setCustomerName,
  phoneNumber,
  setPhoneNumber,
  handleCompleteOrder,
  isLoading,
  language,
  translations
}: OrderDialogProps) {
  return (
    <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
      <DialogContent className={`sm:max-w-[425px] ${language === 'he' ? 'rtl text-right [&>button]:left-4 [&>button]:right-auto' : 'ltr text-left'}`}>
        <DialogHeader className={`${language === 'he' ? 'ml-8' : 'mr-8'}`}>
          <DialogTitle className={language === 'he' ? 'text-right' : 'text-left'}>
            {translations[language].contact.title}
          </DialogTitle>
          <DialogDescription className={language === 'he' ? 'text-right' : 'text-left'}>
            {translations[language].contact.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {translations[language].contact.name}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full p-2 border rounded-md ${language === 'he' ? 'text-right' : 'text-left'}`}
              placeholder={translations[language].contact.namePlaceholder}
              maxLength={15}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {translations[language].contact.phone}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full p-2 border rounded-md ${language === 'he' ? 'text-right' : 'text-left'}`}
              placeholder={translations[language].contact.phonePlaceholder}
              maxLength={10}
              required
            />
          </div>
          <div className={`flex ${language === 'he' ? 'flex-row-reverse' : ''} justify-end space-x-2 pt-4`}>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              {translations[language].order.cancel}
            </Button>
            <Button onClick={handleCompleteOrder} disabled={isLoading}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                translations[language].order.confirmOrder
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
