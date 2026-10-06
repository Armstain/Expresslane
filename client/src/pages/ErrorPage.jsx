import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import Logo from '@/components/Shared/Logo.jsx'

const ErrorPage = () => {
    const navigate = useNavigate()
    const error = useRouteError()
    const notFound = isRouteErrorResponse(error) && error.status === 404

    return (
        <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 text-center'>
            <div className='absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]' aria-hidden='true' />
            <Logo className='mb-12' />
            <p className='text-7xl font-extrabold tracking-tight text-primary sm:text-8xl'>
                {notFound ? '404' : 'Oops'}
            </p>
            <h1 className='mt-4 text-2xl font-bold sm:text-3xl'>
                {notFound ? 'This page took a wrong turn' : 'Something went wrong'}
            </h1>
            <p className='mt-3 max-w-md text-muted-foreground'>
                {notFound
                    ? "We couldn't find the page you were looking for. It may have moved or never existed."
                    : 'An unexpected error occurred. Please try again in a moment.'}
            </p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                <Button variant='outline' size='lg' onClick={() => navigate(-1)}>
                    <ArrowLeft className='h-4 w-4' /> Go back
                </Button>
                <Button size='lg' asChild>
                    <Link to='/'>
                        <Home className='h-4 w-4' /> Take me home
                    </Link>
                </Button>
            </div>
        </main>
    )
}

export default ErrorPage
