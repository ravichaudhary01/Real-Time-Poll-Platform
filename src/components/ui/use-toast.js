
import { useState, useEffect } from "react"

const TOAST_LIMIT = 3 // Allow more toasts for better feedback in a polling app
let count = 0
function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastTimeouts = new Map()

const toastStore = {
  state: {
    toasts: [],
  },
  listeners: [],
  
  getState: () => toastStore.state,
  
  setState: (nextState) => {
    if (typeof nextState === 'function') {
      toastStore.state = nextState(toastStore.state)
    } else {
      toastStore.state = { ...toastStore.state, ...nextState }
    }
    
    toastStore.listeners.forEach(listener => listener(toastStore.state))
  },
  
  subscribe: (listener) => {
    toastStore.listeners.push(listener)
    return () => {
      toastStore.listeners = toastStore.listeners.filter(l => l !== listener)
    }
  },

  addToast: (toastProps) => {
    const id = generateId();
    const dismiss = () => toastStore.dismissToast(id);

    toastStore.setState((state) => ({
      ...state,
      toasts: [
        { ...toastProps, id, dismiss },
        ...state.toasts,
      ].slice(0, TOAST_LIMIT),
    }));
    
    if (toastProps.duration && toastProps.duration !== Infinity) {
      const timeoutId = setTimeout(() => {
        dismiss();
      }, toastProps.duration);
      toastTimeouts.set(id, timeoutId);
    }
    return { id, dismiss };
  },

  dismissToast: (id) => {
    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id));
      toastTimeouts.delete(id);
    }
    toastStore.setState((state) => ({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  updateToast: (id, props) => {
    toastStore.setState((state) => ({
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, ...props } : t
      ),
    }));
  }
};

export const toast = ({ ...props }) => {
  return toastStore.addToast(props);
}

export function useToast() {
  const [state, setState] = useState(toastStore.getState());
  
  useEffect(() => {
    const unsubscribe = toastStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return {
    toast,
    toasts: state.toasts,
    dismiss: toastStore.dismissToast
  };
}
