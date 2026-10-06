import React, { createContext, useContext, useState, useEffect } from 'react'
import en from './en.js'
import bn from './bn.js'

const dictionaries = { en, bn }

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, params) => key
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('lang')
      return saved === 'bn' ? 'bn' : 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = (nextLang) => {
    const val = nextLang === 'bn' ? 'bn' : 'en'
    setLangState(val)
    try {
      localStorage.setItem('lang', val)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = (key, params = {}) => {
    const dict = dictionaries[lang] || dictionaries.en
    let str = dict[key] || dictionaries.en[key] || key

    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v ?? '')
      })
    }
    return str
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
