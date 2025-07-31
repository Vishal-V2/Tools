// Global type declarations for SafeClick

declare global {
  interface Window {
    hackskyAnalyzer?: any
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