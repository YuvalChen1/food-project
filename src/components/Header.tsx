import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Language } from "@/lib/translations";

interface HeaderProps {
  language: Language;
  translations: any;
  setLanguage: (lang: Language) => void;
}

export function Header({ language, translations, setLanguage }: HeaderProps) {
  return (
    <header className="w-full bg-black/80 backdrop-blur-sm text-white sticky top-0 z-50">
      <div className="container mx-auto h-16 sm:h-20 px-4 flex items-center justify-between">
        <a className="flex items-center justify-center" href="#">
          <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />
          <span className="ml-2 text-lg sm:text-xl md:text-2xl font-bold">
            {translations[language].title}
          </span>
        </a>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
          className="text-white hover:text-white border-white hover:bg-white/10 bg-transparent"
        >
          {language === 'en' ? 'עברית' : 'English'}
        </Button>
      </div>
    </header>
  );
}
