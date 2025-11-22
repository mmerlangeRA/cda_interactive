import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageChooser: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" id="language-dropdown" size="sm">
        <span style={{ fontSize: '1.2em', marginRight: '0.5rem' }}>{currentLanguage.flag}</span>
        {currentLanguage.name}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {languages.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            active={language === lang.code}
            onClick={() => setLanguage(lang.code)}
          >
            <span style={{ fontSize: '1.2em', marginRight: '0.5rem' }}>{lang.flag}</span>
            {lang.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageChooser;
