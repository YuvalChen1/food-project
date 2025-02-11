import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mic, MicOff } from "lucide-react";
import { Language } from "@/lib/translations";

interface AIChatProps {
  showAIChat: boolean;
  setShowAIChat: (show: boolean) => void;
  aiMessage: string;
  setAIMessage: (message: string) => void;
  isListening: boolean;
  startListening: () => void;
  handleAIChat: () => void;
  isProcessingAI: boolean;
  language: Language;
  translations: any;
}

export function AIChat({
  showAIChat,
  setShowAIChat,
  aiMessage,
  setAIMessage,
  isListening,
  startListening,
  handleAIChat,
  isProcessingAI,
  language,
  translations
}: AIChatProps) {
  return (
    <>
      <Button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white z-50"
      >
        {language === 'he' ? '🤖 AI הזמן עם ' : '🤖 Order with AI'}
      </Button>

      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className={`sm:max-w-[425px] ${language === 'he' ? 'rtl text-right' : 'ltr text-left'}`}>
          <DialogHeader className={`${language === 'he' ? 'ml-8' : 'mr-8'}`}>
            <DialogTitle 
              className={language === 'he' ? 'text-right' : 'text-left'}
              dangerouslySetInnerHTML={{ __html: translations[language].ai.title }}
            />
            <DialogDescription 
              className={language === 'he' ? 'text-right' : 'text-left'}
              dangerouslySetInnerHTML={{ __html: translations[language].ai.description }}
            />
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAIMessage(e.target.value)}
                  placeholder={translations[language].ai.placeholder}
                  className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    language === 'he' ? 'text-right' : 'text-left'
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`absolute ${language === 'he' ? 'left-2' : 'right-2'} bottom-2`}
                  onClick={startListening}
                  disabled={isListening}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button 
                onClick={handleAIChat} 
                disabled={isProcessingAI || !aiMessage.trim()}
              >
                {isProcessingAI ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {translations[language].ai.processing}
                  </div>
                ) : (
                  translations[language].ai.send
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
