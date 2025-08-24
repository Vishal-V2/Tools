// Global type declarations for Factora

declare global {
  interface Window {
    factoraAnalyzer?: any
  }
}

// Chrome extension types
declare namespace chrome {
  namespace runtime {
    const onMessage: any
    const sendMessage: any
    const onInstalled: any
  }
  
  namespace storage {
    namespace local {
      function get(keys: string[], callback: (result: any) => void): void
      function set(items: any, callback?: () => void): void
    }
  }
  
  namespace action {
    const onClicked: any
  }
  
  namespace tabs {
    const sendMessage: any
  }
}

export {} 