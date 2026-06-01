import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';

import "primereact/resources/themes/lara-light-cyan/theme.css";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </PrimeReactProvider>
  </StrictMode>,
)
