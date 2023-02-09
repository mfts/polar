import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Organization from './organization'

const Root = () => {
  return <h1 className="text-3xl font-bold underline mt-10">Dashboard 1337</h1>
}

const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: <Root />,
  },
  {
    path: '/dashboard/:slug',
    element: <Organization />,
  },
])

const Dashboard = () => {
  return <RouterProvider router={router} />
}

export default Dashboard