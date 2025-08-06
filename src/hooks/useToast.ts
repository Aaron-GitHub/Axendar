import toast from 'react-hot-toast'

interface ToastOptions {
  type: 'success' | 'error' | 'info'
  title: string
  message: string
}

export const useToast = () => {
  const showToast = ({ type, title, message }: ToastOptions) => {
    const options = {
      duration: 4000,
      position: 'top-right' as const,
    }

    switch (type) {
      case 'success':
        toast.success(`${title} - ${message}`, options)
        break
      case 'error':
        toast.error(`${title} - ${message}`, options)
        break
      case 'info':
        toast(`${title} - ${message}`, options)
        break
    }
  }

  return { showToast }
}
