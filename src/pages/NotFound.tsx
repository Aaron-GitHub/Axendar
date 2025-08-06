import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Página no encontrada</h2>
        <p className="mt-2 text-base text-gray-500">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate(-1)}>
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
