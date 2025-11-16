import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Add a global declaration for MercadoPago to inform TypeScript that it exists on the window object.
declare global {
  interface Window {
    MercadoPago: any;
  }
}

// ===================================================================================
// Initial Data with Inventory and Multiple Images
// ===================================================================================
const initialProducts = [
  // Caballero
  { id: 1, name: 'Chaqueta de Cuero "Inferno"', price: 250000, category: 'caballero', images: ['https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/16170/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'], description: 'Chaqueta de cuero genuino con un estilo rockero y audaz. Perfecta para dominar la noche.', stock: [{size: 'S', quantity: 5}, {size: 'M', quantity: 3}, {size: 'L', quantity: 1}, {size: 'XL', quantity: 0}] },
  { id: 4, name: 'Jeans Rotos "Rebel"', price: 150000, category: 'caballero', images: ['https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Jeans con un look desgastado y moderno para un espíritu libre y rebelde.', stock: [{size: '28', quantity: 10}, {size: '30', quantity: 12}, {size: '32', quantity: 8}, {size: '34', quantity: 4}, {size: '36', quantity: 2}] },
  { id: 6, name: 'Botas "Vulcano"', price: 220000, category: 'caballero', images: ['https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Botas de combate robustas y con estilo. Pisa fuerte a donde vayas.', stock: [{size: '40', quantity: 6}, {size: '41', quantity: 7}, {size: '42', quantity: 4}, {size: '43', quantity: 0}, {size: '44', quantity: 2}] },
  { id: 9, name: 'Camiseta Gráfica "Fénix"', price: 85000, category: 'caballero', images: ['https://images.pexels.com/photos/13159244/pexels-photo-13159244.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Una camiseta con un diseño de fénix resurgiendo de las llamas. Pura actitud.', stock: [{size: 'S', quantity: 20}, {size: 'M', quantity: 15}, {size: 'L', quantity: 10}, {size: 'XL', quantity: 5}] },
  { id: 17, name: 'Sudadera con Capucha "Nocturno"', price: 180000, category: 'caballero', images: ['https://images.pexels.com/photos/2589410/pexels-photo-2589410.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Sudadera negra minimalista para un look urbano y misterioso.', stock: [{size: 'S', quantity: 10}, {size: 'M', quantity: 8}, {size: 'L', quantity: 6}, {size: 'XL', quantity: 0}] },
  { id: 18, name: 'Pantalones Chino "Asfalto"', price: 160000, category: 'caballero', images: ['https://images.pexels.com/photos/769733/pexels-photo-769733.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Pantalones chinos slim-fit, versátiles para cualquier ocasión.', stock: [{size: '28', quantity: 8}, {size: '30', quantity: 10}, {size: '32', quantity: 7}, {size: '34', quantity: 3}] },
  { id: 19, name: 'Anillo de Sello "Sombra"', price: 75000, category: 'caballero', images: ['https://images.pexels.com/photos/10983636/pexels-photo-10983636.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Anillo de acero inoxidable con un diseño sobrio y potente.', stock: [{size: 'Talla Única', quantity: 25}] },
  { id: 20, name: 'Pulsera de Cuero "Nómada"', price: 65000, category: 'caballero', images: ['https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Pulsera de cuero trenzado para el espíritu aventurero.', stock: [{size: 'Talla Única', quantity: 30}] },
  // Dama
  { id: 2, name: 'Vestido "Llama Roja"', price: 180000, category: 'dama', images: ['https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Un vestido rojo vibrante que captura todas las miradas. Siente el calor de la moda.', stock: [{size: 'XS', quantity: 4}, {size: 'S', quantity: 8}, {size: 'M', quantity: 5}, {size: 'L', quantity: 0}] },
  { id: 5, name: 'Blusa "Ceniza"', price: 75000, category: 'dama', images: ['https://images.pexels.com/photos/1963075/pexels-photo-1963075.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Una blusa corta y atrevida que es pura energía. Ideal para festivales y conciertos.', stock: [{size: 'XS', quantity: 10}, {size: 'S', quantity: 12}, {size: 'M', quantity: 15}, {size: 'L', quantity: 8}, {size: 'XL', quantity: 4}, {size: 'XXL', quantity: 2}] },
  { id: 8, name: 'Jeans Skinny "Carbón"', price: 120000, category: 'dama', images: ['https://images.pexels.com/photos/1597599/pexels-photo-1597599.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Jeans skinny de tiro alto para dama, versátiles y sentadores.', stock: [{size: '6', quantity: 10}, {size: '8', quantity: 14}, {size: '10', quantity: 11}, {size: '12', quantity: 6}, {size: '14', quantity: 3}] },
  { id: 10, name: 'Falda de Malla "Obsidiana"', price: 95000, category: 'dama', images: ['https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Falda de malla negra, perfecta para superponer y crear un look nocturno inolvidable.', stock: [{size: 'S', quantity: 8}, {size: 'M', quantity: 10}, {size: 'L', quantity: 0}] },
  { id: 21, name: 'Jumpsuit "Medianoche"', price: 230000, category: 'dama', images: ['https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Un jumpsuit elegante y atrevido para conquistar la noche.', stock: [{size: 'XS', quantity: 5}, {size: 'S', quantity: 7}, {size: 'M', quantity: 4}, {size: 'L', quantity: 2}] },
  { id: 22, name: 'Shorts de Jean "Sirena"', price: 110000, category: 'dama', images: ['https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Shorts de jean de tiro alto con detalles desgastados.', stock: [{size: '6', quantity: 9}, {size: '8', quantity: 11}, {size: '10', quantity: 8}, {size: '12', quantity: 0}] },
  { id: 23, name: 'Crop Top "Elemento"', price: 65000, category: 'dama', images: ['https://images.pexels.com/photos/1578997/pexels-photo-1578997.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Crop top básico de algodón, esencial en cualquier guardarropa.', stock: [{size: 'XS', quantity: 15}, {size: 'S', quantity: 20}, {size: 'M', quantity: 18}, {size: 'L', quantity: 10}] },
  { id: 24, name: 'Aretes Largos "Cascada"', price: 55000, category: 'dama', images: ['https://images.pexels.com/photos/11299901/pexels-photo-11299901.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Aretes largos y finos que añaden un toque de elegancia a tu look.', stock: [{size: 'Talla Única', quantity: 22}] },
  // Accesorios
  { id: 3, name: 'Gafas de Sol "Eclipse"', price: 90000, category: 'accesorios', images: ['https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/39716/pexels-photo-39716.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Protección y estilo en un diseño futurista. Bloquea el sol, no las miradas.', stock: [{size: 'Talla Única', quantity: 15}] },
  { id: 7, name: 'Gorra "Brasa"', price: 60000, category: 'accesorios', images: ['https://images.pexels.com/photos/1878821/pexels-photo-1878821.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Gorra negra con un diseño de llama bordado. El toque final para un look ardiente.', stock: [{size: 'Talla Única', quantity: 20}] },
  { id: 11, name: 'Collar de Cadena "Ignis"', price: 70000, category: 'accesorios', images: ['https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Robusto collar de cadena de acero que añade un toque industrial a cualquier outfit.', stock: [{size: 'Talla Única', quantity: 18}] },
  { id: 12, name: 'Cinturón con Tachas "Magma"', price: 80000, category: 'accesorios', images: ['https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Cinturón de cuero sintético con tachas metálicas. Define tu cintura con actitud.', stock: [{size: 'Talla Única', quantity: 0}] },
  { id: 25, name: 'Mochila Urbana "Explorador"', price: 190000, category: 'accesorios', images: ['https://images.pexels.com/photos/1546899/pexels-photo-1546899.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Mochila funcional y con estilo, lista para la jungla de asfalto.', stock: [{size: 'Talla Única', quantity: 10}] },
  { id: 26, name: 'Billetera de Cuero "Compacta"', price: 95000, category: 'accesorios', images: ['https://images.pexels.com/photos/445109/pexels-photo-445109.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Billetera de cuero minimalista, práctica y duradera.', stock: [{size: 'Talla Única', quantity: 12}] },
  { id: 27, name: 'Bufanda "Niebla"', price: 70000, category: 'accesorios', images: ['https://images.pexels.com/photos/1457913/pexels-photo-1457913.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Bufanda ligera de algodón en tonos grises.', stock: [{size: 'Talla Única', quantity: 14}] },
  { id: 28, name: 'Pañuelo Estampado "Furia"', price: 50000, category: 'accesorios', images: ['https://images.pexels.com/photos/2080960/pexels-photo-2080960.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Pañuelo con estampado abstracto para usar en el cuello, cabeza o muñeca.', stock: [{size: 'Talla Única', quantity: 25}] },
  // Ofertas
  { id: 99, name: 'Producto de Prueba', price: 1, category: 'ofertas', images: ['https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Este es un producto de bajo costo para probar la pasarela de pagos de Mercado Pago.', stock: [{size: 'Prueba', quantity: 100}] },
  { id: 13, name: 'Sudadera "Volcán" - OFERTA', price: 110000, originalPrice: 160000, category: 'ofertas', images: ['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Sudadera cómoda con un estampado tie-dye en tonos de lava. ¡Precio especial!', stock: [{size: 'S', quantity: 5}, {size: 'M', quantity: 3}, {size: 'L', quantity: 0}] },
  { id: 14, name: 'Top de Bikini "Solar" - OFERTA', price: 50000, originalPrice: 75000, category: 'ofertas', images: ['https://images.pexels.com/photos/1639735/pexels-photo-1639735.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Top de bikini naranja neón para brillar bajo el sol. ¡Unidades limitadas!', stock: [{size: 'XS', quantity: 8}, {size: 'S', quantity: 6}, {size: 'M', quantity: 4}] },
  { id: 15, name: 'Gorro "Humo" - OFERTA', price: 40000, originalPrice: 60000, category: 'ofertas', images: ['https://images.pexels.com/photos/2529377/pexels-photo-2529377.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Gorro de lana gris oscuro, perfecto para los días más fríos. No dejes pasar esta oferta.', stock: [{size: 'Talla Única', quantity: 10}] },
  { id: 16, name: 'Shorts Cargo "Duna" - OFERTA', price: 80000, originalPrice: 110000, category: 'ofertas', images: ['https://images.pexels.com/photos/1576403/pexels-photo-1576403.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Shorts estilo cargo para dama, cómodos y funcionales. ¡A un precio increíble!', stock: [{size: '6', quantity: 0}, {size: '8', quantity: 5}, {size: '10', quantity: 3}] },
  { id: 29, name: 'Camisa Leñador "Flama" - OFERTA', price: 90000, originalPrice: 140000, category: 'ofertas', images: ['https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Camisa de franela a cuadros, un clásico que no pasa de moda.', stock: [{size: 'S', quantity: 6}, {size: 'M', quantity: 8}, {size: 'L', quantity: 4}, {size: 'XL', quantity: 2}] },
  { id: 30, name: 'Bolso "Estelar" - OFERTA', price: 70000, originalPrice: 115000, category: 'ofertas', images: ['https://images.pexels.com/photos/157888/fashion-bag-handbag-cloth-157888.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Bolso pequeño tipo bandolera con detalles metálicos.', stock: [{size: 'Talla Única', quantity: 7}] },
  { id: 31, name: 'Chaqueta Rompevientos "Tormenta" - OFERTA', price: 120000, originalPrice: 180000, category: 'ofertas', images: ['https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Chaqueta ligera y resistente al agua, ideal para cambios de clima.', stock: [{size: 'S', quantity: 5}, {size: 'M', quantity: 0}, {size: 'L', quantity: 3}] },
  { id: 32, name: 'Tenis Blancos "Lienzo" - OFERTA', price: 130000, originalPrice: 190000, category: 'ofertas', images: ['https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=600'], description: 'Tenis blancos clásicos, la base perfecta para cualquier outfit.', stock: [{size: '39', quantity: 4}, {size: '40', quantity: 6}, {size: '41', quantity: 5}, {size: '42', quantity: 2}] },
];

const initialTheme = {
  logoSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAA+CAMAAAC2gDk+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJaUExURQAAAP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lEP/lFpM4OEAAAA8dFJOUwAQFBkgISIjJCYnKCkqKywvMDEyNDU2Nzg5Ojs8PT5AQUJDREVGR0hJSkxNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ucHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/xW0d6QAAAAlwSFlzAAAPYQAAD2EBqD0eUAAAB7RJREFUGJVjYCAeMApgo5GBgQXEMDImQnEGBgYGBkC2DAxGBgYD4gABBgDGBgLTA3V0AAAAAElFTSuQmCC',
  brandName: 'FIEBRE',
  primaryColor: '#ff7a00',
  secondaryColor: '#ff4800',
  backgroundColor: '#111111',
  textColor: '#ffffff',
  panelColor: 'rgba(20, 20, 20, 0.8)',
};

const initialCategories = ['dama', 'caballero', 'accesorios', 'ofertas'];

const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const persistentState = localStorage.getItem(key);
      if (persistentState === null) {
        return defaultValue;
      }
      
      const storedValue = JSON.parse(persistentState);

      // Special handling for objects to merge and add new keys from default.
      if (typeof defaultValue === 'object' && !Array.isArray(defaultValue) && defaultValue !== null &&
          typeof storedValue === 'object' && !Array.isArray(storedValue) && storedValue !== null) {
        return { ...defaultValue, ...storedValue };
      }

      // For everything else (arrays, strings, numbers, or mismatched types), the stored value takes precedence.
      // If storedValue is null (from JSON.parse('null')), prefer defaultValue.
      return storedValue !== null ? storedValue : defaultValue;

    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

const App = () => {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [orders, setOrders] = useState([]);
  const [theme, setTheme] = usePersistentState('fiebre-theme', initialTheme);
  const [whatsappNumber, setWhatsappNumber] = useState("573001234567");
  const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = usePersistentState('mp-public-key', '');
  const [cart, setCart] = usePersistentState('fiebre-cart', []);
  const [adminPassword, setAdminPassword] = useState('Dbonilla2025$');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAiStylistOpen, setIsAiStylistOpen] = useState(false);
  
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--fire-start', theme.secondaryColor);
    document.documentElement.style.setProperty('--fire-end', theme.primaryColor);
    document.documentElement.style.setProperty('--bg', theme.backgroundColor);
    document.documentElement.style.setProperty('--text', theme.textColor);
    document.documentElement.style.setProperty('--panel-bg', theme.panelColor);
  }, [theme]);
  
  useEffect(() => {
    let keySequence = '';
    const target = 'admin';
    const handler = (e) => {
        keySequence += e.key.toLowerCase();
        if (keySequence.length > target.length) {
            keySequence = keySequence.slice(keySequence.length - target.length);
        }
        if (keySequence === target) {
            openAdminPanel();
            keySequence = '';
        }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const openAdminPanel = () => {
    if (isAuthenticated) {
        setIsAdminPanelOpen(true);
    } else {
        setIsPasswordModalOpen(true);
    }
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (loginPassword === adminPassword) {
      setIsAuthenticated(true);
      setIsPasswordModalOpen(false);
      setIsAdminPanelOpen(true);
      setLoginPassword('');
    } else {
      showToast('Contraseña incorrecta', 'danger');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminPanelOpen(false);
    showToast('Sesión cerrada');
  };

  const handleChangePassword = (currentPassword, newPassword) => {
    if (currentPassword === adminPassword) {
        setAdminPassword(newPassword);
        showToast('Contraseña actualizada con éxito');
        return true;
    } else {
        showToast('La contraseña actual es incorrecta', 'danger');
        return false;
    }
  };

  const addToCart = (product, size) => {
    if (!size) {
        showToast('Por favor selecciona una talla', 'danger');
        return;
    }

    const availableStock = product.stock.find(s => s.size === size)?.quantity || 0;
    if (availableStock === 0) {
        showToast('Este producto está agotado en la talla seleccionada', 'danger');
        return;
    }

    const itemInCart = cart.find(item => item.id === product.id && item.size === size);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (quantityInCart >= availableStock) {
        showToast('No hay más stock disponible para este producto', 'danger');
        return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, size }];
    });
    
    const cartBtn = document.querySelector('.cart-btn');
    if(cartBtn) {
      cartBtn.classList.add('cart-animate');
      setTimeout(() => cartBtn.classList.remove('cart-animate'), 500);
    }
    showToast(`${product.name} agregado al carrito`);
  };

  const removeFromCart = (productId, size) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === productId && item.size === size)));
    showToast('Producto eliminado del carrito');
  };
  
  const updateCartQuantity = (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;
    const availableStock = product.stock.find(s => s.size === size)?.quantity || 0;
    
    if (newQuantity > availableStock) {
        showToast(`Solo hay ${availableStock} en stock para esta talla`, 'danger');
        return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
  }, []);
  
  const closeModals = () => {
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsAdminPanelOpen(false);
    setIsPasswordModalOpen(false);
    setIsConfirmationOpen(false);
    setIsAiStylistOpen(false);
    document.body.classList.remove('modal-open');
  };

  const handleProceedToCheckout = () => {
    if(cart.length === 0) {
        showToast('Tu carrito está vacío', 'danger');
        return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    const customerDetails = {
        name: `${paymentResult.payer.first_name || 'Usuario'} ${paymentResult.payer.last_name || 'de Prueba'}`.trim(),
        email: paymentResult.payer.email,
        address: 'N/A (Gestionado por Mercado Pago)',
        city: 'N/A',
    };

    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      customer: customerDetails,
      items: cart,
      total: cartTotal,
      paymentMethod: `Mercado Pago (${paymentResult.payment_method_id})`,
      paymentId: paymentResult.id,
    };
    setOrders(prev => [newOrder, ...prev]);

    // Update stock
    const newProducts = [...products];
    cart.forEach(cartItem => {
        const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
            const stockIndex = newProducts[productIndex].stock.findIndex(s => s.size === cartItem.size);
            if (stockIndex !== -1) {
                newProducts[productIndex].stock[stockIndex].quantity -= cartItem.quantity;
            }
        }
    });
    setProducts(newProducts);

    setIsProcessingPayment(false);
    setCart([]);
    closeModals();
    showToast('¡Pago procesado con éxito!');
  };
  
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsNavOpen(false);
    requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 80; // height of sticky header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  };
  
  const totalItemsInCart = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  
  useEffect(() => {
    const isModalVisible = selectedProduct || isCartOpen || isCheckoutOpen || isAdminPanelOpen || isPasswordModalOpen || isConfirmationOpen || isAiStylistOpen;
    document.body.classList.toggle('modal-open', isModalVisible);
  }, [selectedProduct, isCartOpen, isCheckoutOpen, isAdminPanelOpen, isPasswordModalOpen, isConfirmationOpen, isAiStylistOpen]);

  const [adminFormState, setAdminFormState] = useState({
    id: null, name: '', price: '', description: '', category: '', images: [] as string[], stock: '', originalPrice: ''
  });
  
  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = [...adminFormState.images];

      filesArray.forEach((file: File) => {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  newImages.push(reader.result);
                  setAdminFormState(prev => ({ ...prev, images: newImages }));
              }
          };
          reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemoveImage = (index) => {
      setAdminFormState(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index)
      }));
  };

  const handleAdminFormSubmit = (e) => {
    e.preventDefault();
    if (adminFormState.images.length === 0) {
        showToast('Debes agregar al menos una imagen', 'danger');
        return;
    }

    const stockArray = adminFormState.stock.split(',')
      .map(s => {
          const parts = s.trim().split(':');
          if (parts.length !== 2) return null;
          const size = parts[0].trim();
          const quantity = parseInt(parts[1].trim(), 10);
          if (!size || isNaN(quantity)) return null;
          return { size, quantity };
      })
      .filter(Boolean);

    if (stockArray.length === 0 && adminFormState.stock.trim() !== '') {
        showToast('Formato de stock inválido. Use: S:10, M:5, ...', 'danger');
        return;
    }
    
    const productPayload = {
      ...adminFormState,
      price: parseFloat(adminFormState.price),
      originalPrice: adminFormState.originalPrice ? parseFloat(adminFormState.originalPrice) : undefined,
      stock: stockArray,
    };

    if (adminFormState.id) { // Editing existing product
      setProducts(products.map(p => p.id === productPayload.id ? productPayload : p));
      showToast('Producto actualizado');
    } else { // Adding new product
      const { id, ...newProductData } = productPayload; // remove null id
      const addedProduct = { ...newProductData, id: Date.now() };
      setProducts(prev => [...prev, addedProduct]);
      showToast('Producto agregado');
    }
    resetAdminForm();
  };

  const editProduct = (product) => {
    setAdminFormState({
      ...product,
      price: String(product.price),
      stock: product.stock.map(s => `${s.size}:${s.quantity}`).join(', '),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    });
    setIsAddingProduct(true);
  };

  const deleteProduct = (id) => {
    setActionToConfirm(() => () => {
      setProducts(products.filter(p => p.id !== id));
      showToast('Producto eliminado');
      setIsConfirmationOpen(false);
    });
    setIsConfirmationOpen(true);
  };

  const resetAdminForm = () => {
    setAdminFormState({ id: null, name: '', price: '', description: '', category: '', images: [] as string[], stock: '', originalPrice: '' });
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setIsAddingProduct(false);
  };
  
  const handleThemeChange = (e) => {
    const { name, value } = e.target;
    setTheme(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWhatsAppChange = (e) => {
      setWhatsappNumber(e.target.value);
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setTheme(prev => ({ ...prev, logoSrc: result }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const ConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className={`modal-box confirmation-modal ${isConfirmationOpen ? 'open' : ''}`}>
      <h3>¿Estás seguro?</h3>
      <p>Esta acción no se puede deshacer.</p>
      <div className="product-card-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-danger" onClick={onConfirm}>Confirmar</button>
      </div>
    </div>
  );
  
  const productSections = useMemo(() => {
    const groupedProducts = products.reduce((acc, product) => {
        (acc[product.category] = acc[product.category] || []).push(product);
        return acc;
    }, {} as Record<string, typeof products>);

    return categories
        .map(category => {
            const categoryProducts = groupedProducts[category];
            if (!categoryProducts || categoryProducts.length === 0) {
                return null;
            }
            return (
                <ProductSection
                    key={category}
                    id={category}
                    title={category.charAt(0).toUpperCase() + category.slice(1)}
                    products={categoryProducts}
                    onProductClick={handleProductClick}
                />
            );
        })
        .filter(Boolean);
  }, [products, categories, handleProductClick]);


  return (
    <>
      <Header 
        logoSrc={theme.logoSrc || initialTheme.logoSrc}
        brandName={theme.brandName}
        isNavOpen={isNavOpen} 
        setIsNavOpen={setIsNavOpen}
        setIsCartOpen={setIsCartOpen}
        totalItemsInCart={totalItemsInCart}
        categories={categories}
        onNavClick={handleNavClick}
      />
      
      <main className="container">
        <Hero brandName={theme.brandName} />
        <AiSearchSection onOpen={() => setIsAiStylistOpen(true)} />
        
        {productSections.length > 0 ? (
            productSections
        ) : (
            <div className="no-results">
                <h3>La tienda está vacía por ahora.</h3>
                <p>¡Vuelve pronto para ver nuestros productos!</p>
            </div>
        )}
      </main>

      <Footer onAdminClick={openAdminPanel} />
      
      <WhatsAppButton whatsappNumber={whatsappNumber} />
      <AiStylistButton onOpen={() => setIsAiStylistOpen(true)} />

      <div className={`backdrop ${selectedProduct || isCartOpen || isCheckoutOpen || isAdminPanelOpen || isPasswordModalOpen || isConfirmationOpen || isAiStylistOpen ? 'visible' : ''}`} onClick={closeModals}></div>
      
      { isProcessingPayment && (
        <div className="payment-processing-overlay" style={{position: 'fixed', borderRadius: 0}}>
            <div className="spinner"></div>
            <p>Finalizando tu pedido...</p>
        </div>
      )}

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        onRemove={removeFromCart}
        onCheckout={handleProceedToCheckout}
        onUpdateQuantity={updateCartQuantity}
      />

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={closeModals}
          onAddToCart={addToCart}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
        />
      )}
        
      <AIStylistModal
        isOpen={isAiStylistOpen}
        onClose={() => setIsAiStylistOpen(false)}
        products={products}
        showToast={showToast}
        onProductClick={(product) => {
            setIsAiStylistOpen(false);
            handleProductClick(product);
        }}
      />

      <CheckoutPanel 
        isOpen={isCheckoutOpen}
        onClose={closeModals}
        onPaymentSuccess={handlePaymentSuccess}
        cartTotal={cartTotal}
        publicKey={mercadoPagoPublicKey}
        setIsProcessing={setIsProcessingPayment}
        showToast={showToast}
      />
      
      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={closeModals}
        onLogout={handleLogout}
        theme={theme}
        onThemeChange={handleThemeChange}
        onLogoChange={handleLogoChange}
        adminFormState={adminFormState}
        onAdminFormChange={handleAdminFormChange}
        onAdminFormSubmit={handleAdminFormSubmit}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        resetAdminForm={resetAdminForm}
        categories={categories}
        products={products}
        editProduct={editProduct}
        deleteProduct={deleteProduct}
        onChangePassword={handleChangePassword}
        showToast={showToast}
        whatsappNumber={whatsappNumber}
        onWhatsAppChange={handleWhatsAppChange}
        mercadoPagoPublicKey={mercadoPagoPublicKey}
        setMercadoPagoPublicKey={setMercadoPagoPublicKey}
        isAddingProduct={isAddingProduct}
        setIsAddingProduct={setIsAddingProduct}
        orders={orders}
      />
      
      <div id="password-modal" className={`modal-box ${isPasswordModalOpen ? 'open' : ''}`}>
         <h3>Acceso de Administrador</h3>
         <form onSubmit={handlePasswordSubmit}>
           <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Contraseña" required />
           <button type="submit" className="btn-primary" style={{width: '100%'}}>Entrar</button>
         </form>
      </div>
      
      <ConfirmationModal 
        onConfirm={actionToConfirm}
        onCancel={() => setIsConfirmationOpen(false)}
      />

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
};

const Header = ({ logoSrc, brandName, isNavOpen, setIsNavOpen, setIsCartOpen, totalItemsInCart, categories, onNavClick }) => (
  <header className="header">
    <div className="header-content container">
      <img
        src={logoSrc}
        alt={`${brandName} Logo`}
        className="logo"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== initialTheme.logoSrc) {
                target.onerror = null; // prevent infinite loops
                target.src = initialTheme.logoSrc;
            }
        }}
      />
      <nav className={`nav ${isNavOpen ? 'open' : ''}`}>
        {categories.map(cat => <a key={cat} href={`#${cat}`} onClick={(e) => onNavClick(e, cat)}>{cat}</a>)}
         <button className={`btn-secondary cart-btn ${totalItemsInCart > 0 ? 'has-items' : ''}`} onClick={() => { setIsCartOpen(true); setIsNavOpen(false); }} aria-label="Abrir carrito de compras">
          Carrito
          {totalItemsInCart > 0 && <span className="cart-count">{totalItemsInCart}</span>}
        </button>
      </nav>
      <button className="hamburger" onClick={() => setIsNavOpen(!isNavOpen)} aria-label="Abrir menú">
        {isNavOpen ? '✖' : '☰'}
      </button>
    </div>
  </header>
);

const Hero = ({ brandName }) => (
  <section className="hero">
    <h1>{brandName}</h1>
    <p>Tu estilo sin límites.</p>
  </section>
);

const AiSearchSection = ({ onOpen }) => {
    return (
        <section className="ai-search-section">
            <button className="ai-search-trigger" onClick={onOpen} aria-label="Abrir Estilista de IA">
                <span role="img" aria-hidden="true" style={{marginRight: '10px'}}>✨</span>
                ¿No sabes qué ponerte? Pide un outfit a nuestro Estilista de IA...
            </button>
        </section>
    );
};


const ProductSection = (props) => {
  const [sortOrder, setSortOrder] = useState('default');

  const sortedProducts = useMemo(() => {
    const sortable = [...props.products];
    switch (sortOrder) {
      case 'price-asc':
        return sortable.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortable.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sortable.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sortable.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sortable;
    }
  }, [props.products, sortOrder]);

  return (
    <section id={props.id} className="product-section">
      <div className="section-header">
        <h2 className="section-title">{props.title}</h2>
        <select className="sort-dropdown" value={sortOrder} onChange={e => setSortOrder(e.target.value)} aria-label={`Ordenar productos en ${props.title}`}>
          <option value="default">Ordenar por defecto</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>
      <div className="products-grid">
        {sortedProducts.map(product => (
          <ProductCard key={product.id} product={product} onProductClick={props.onProductClick} />
        ))}
      </div>
    </section>
  );
};


const ProductCard = (props) => (
  <div className="product-card">
    <img src={props.product.images && props.product.images.length > 0 ? props.product.images[0] : 'https://via.placeholder.com/300'} alt={props.product.name} onClick={() => props.onProductClick(props.product)} />
    <div className="product-card-info">
      <h3>{props.product.name}</h3>
      <p className="price">
        {props.product.originalPrice && <del style={{color: '#aaa', marginRight: '8px'}}>{formatPrice(props.product.originalPrice)}</del>}
        {formatPrice(props.product.price)}
      </p>
      <div className="product-card-actions">
        <button className="btn-secondary" onClick={() => props.onProductClick(props.product)}>Ver Detalles</button>
        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); props.onProductClick(props.product); }}>Añadir</button>
      </div>
    </div>
  </div>
);

const Footer = ({ onAdminClick }) => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} FIEBRE. Todos los derechos reservados.</p>
    <p><a href="#" onClick={(e) => { e.preventDefault(); onAdminClick(); }}>Panel de Administrador</a></p>
  </footer>
);

const WhatsAppButton = ({ whatsappNumber }) => {
  const message = "Hola, me gustaría recibir asesoría sobre los productos de FIEBRE.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-btn floating-btn" aria-label="Contactar por WhatsApp">
      💬
    </a>
  );
};

const AiStylistButton = ({ onOpen }) => (
    <button onClick={onOpen} className="ai-stylist-btn floating-btn" aria-label="Abrir Estilista de IA">
        🔥
    </button>
);


const AIStylistModal = ({ isOpen, onClose, products, showToast, onProductClick }) => {
    const [step, setStep] = useState('welcome'); // 'welcome', 'stylist'
    const [gender, setGender] = useState('');
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!gender) {
            showToast('Selecciona si el outfit es para Dama o Caballero.', 'danger');
            return;
        }
        if (!prompt) {
            showToast('Describe el estilo que buscas.', 'danger');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse(null);

        const productCatalog = products.map(({ id, name, description, category, price }) => ({ id, name, description, category, price }));
        const systemInstruction = 'Eres FIEBRE AI, un estilista de moda experto con un estilo rebelde, audaz y salvaje. Tu misión es crear outfits inolvidables usando SÓLO los productos del catálogo. Eres directo y creativo. Responde únicamente en formato JSON.';
        const fullPrompt = `Quiero un outfit para ${gender}. Mi idea es: "${prompt}". Crea un outfit completo y coherente.`;

        try {
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `${fullPrompt}. Catálogo de productos disponible: ${JSON.stringify(productCatalog)}`,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            outfitTitle: { type: Type.STRING, description: 'Un nombre creativo y rebelde para el outfit.' },
                            recommendationText: { type: Type.STRING, description: 'Una explicación audaz de por qué este outfit funciona.' },
                            products: {
                                type: Type.ARRAY,
                                description: 'Una lista de 2 a 4 IDs de productos del catálogo que componen el outfit.',
                                items: {
                                    type: Type.OBJECT,
                                    properties: { id: { type: Type.NUMBER } }
                                }
                            }
                        },
                        required: ['outfitTitle', 'recommendationText', 'products']
                    }
                }
            });
            
            const responseText = result.text;
            if (!responseText) throw new Error("La IA no generó una respuesta de texto.");
            const jsonResponse = JSON.parse(responseText);
            
            const populatedResponse = {
                ...jsonResponse,
                products: jsonResponse.products.map(p => products.find(fullP => fullP.id === p.id)).filter(Boolean)
            };
            
            setResponse(populatedResponse);
        } catch (e) {
            console.error(e);
            setError("Hubo un problema generando el outfit. La IA está recargando su energía. Inténtalo de nuevo.");
            showToast('Error de la IA. Inténtalo de nuevo.', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep('welcome');
        setGender('');
        setPrompt('');
        setResponse(null);
        setIsLoading(false);
        setError(null);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed for a clean opening next time
            handleClose();
        }
    }, [isOpen]);

    return (
        <div className={`ai-stylist-modal modal-box ${isOpen ? 'open' : ''}`}>
            <button onClick={handleClose} className="close-btn">&times;</button>
            <div className="ai-stylist-content">
                {step === 'welcome' && (
                    <div className="welcome-screen">
                        <h2>Estilista de IA</h2>
                        <p className="ai-subtitle">¿Sin inspiración? Describe tu vibra, nosotros creamos el outfit.</p>
                        <div className="example-prompts">
                            <p><strong>Pide cosas como:</strong></p>
                            <ul>
                                <li>"Un look para un concierto de rock este fin de semana"</li>
                                <li>"Algo cómodo pero con estilo para una salida casual en la ciudad"</li>
                                <li>"Un outfit atrevido y memorable para una primera cita"</li>
                            </ul>
                        </div>
                        <button className="btn-primary" onClick={() => setStep('stylist')}>🔥 Empezar a Crear</button>
                    </div>
                )}
                
                {step === 'stylist' && (
                     <div className="stylist-screen">
                        <h2>Tu Estilo, Tus Reglas</h2>
                        <div className="ai-gender-selector">
                            <button className={`btn-secondary ${gender === 'dama' ? 'active' : ''}`} onClick={() => setGender('dama')}>Dama</button>
                            <button className={`btn-secondary ${gender === 'caballero' ? 'active' : ''}`} onClick={() => setGender('caballero')}>Caballero</button>
                        </div>
                        <textarea 
                            placeholder="Describe la ocasión o el estilo que buscas..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={4}
                        />
                        <button className="btn-primary" onClick={handleGenerate} disabled={isLoading || !prompt || !gender}>
                            {isLoading ? 'CREANDO...' : 'GENERAR OUTFIT'}
                        </button>
                        
                        {isLoading && <div className="ai-loader">Buscando en el armario...</div>}
                        {error && <div className="ai-error">{error}</div>}

                        {response && !isLoading && (
                            <div className="result-display">
                                <h3>{response.outfitTitle}</h3>
                                <p>{response.recommendationText}</p>
                                <div className="ai-recommended-products">
                                    {response.products.map(product => (
                                        <div key={product.id} className="ai-product-card" onClick={() => onProductClick(product)}>
                                            <img src={product.images[0]} alt={product.name} />
                                            <span>{product.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


const CartSidebar = ({ isOpen, onClose, cart, cartTotal, onRemove, onCheckout, onUpdateQuantity }) => (
    <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
            <h2>Tu Carrito</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="cart-body">
            {cart.length === 0 ? (
                <p className="cart-empty-message">Tu carrito está vacío.</p>
            ) : (
                cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="cart-item">
                        <img src={item.images[0]} alt={item.name} />
                        <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            <p className="cart-item-meta">Talla: {item.size}</p>
                            <div className="cart-quantity-handler">
                                <div className="quantity-adjuster">
                                    <button onClick={() => onUpdateQuantity(item.id, item.size, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.size, item.quantity + 1)}>+</button>
                                </div>
                                <p className="price">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        </div>
                        <button className="remove-item-btn" onClick={() => onRemove(item.id, item.size)}>&times;</button>
                    </div>
                ))
            )}
        </div>
        {cart.length > 0 && (
            <div className="cart-footer">
                <div className="cart-total">
                    <span>Total:</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={onCheckout}>Finalizar Compra</button>
            </div>
        )}
    </aside>
);


const ProductModal = ({ product, onClose, onAddToCart, selectedSize, setSelectedSize }) => {
    const [mainImage, setMainImage] = useState(product.images && product.images.length > 0 ? product.images[0] : '');

    useEffect(() => {
        if(product.images && product.images.length > 0) {
            setMainImage(product.images[0]);
        }
    }, [product]);

    return (
        <div className={`modal-box ${product ? 'open' : ''}`}>
            <button onClick={onClose} style={{position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem'}}>&times;</button>
            <div className="product-modal-content">
              <div className="product-image-gallery">
                <img src={mainImage} alt={product.name} className="main-image"/>
                {product.images.length > 1 && (
                    <div className="thumbnail-container">
                        {product.images.map((img, index) => (
                            <img 
                                key={index}
                                src={img}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                                onClick={() => setMainImage(img)}
                            />
                        ))}
                    </div>
                )}
              </div>
              <div className="product-modal-details">
                <h2>{product.name}</h2>
                <p className="price">
                  {product.originalPrice && <del style={{color: '#aaa', marginRight: '8px'}}>{formatPrice(product.originalPrice)}</del>}
                  {formatPrice(product.price)}
                </p>
                <p>{product.description}</p>
                
                <div className="sizes-container">
                  <h4>Talla:</h4>
                  {product.stock.map(item => (
                    <button 
                      key={item.size} 
                      className={`size-btn ${selectedSize === item.size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(item.size)}
                      disabled={item.quantity === 0}
                      title={item.quantity > 0 ? `${item.quantity} disponibles` : 'Agotado'}
                    >
                      {item.size}
                      <small>{item.quantity > 0 ? `(${item.quantity})` : 'Agotado'}</small>
                    </button>
                  ))}
                </div>

                <button 
                  className="btn-primary" 
                  style={{width: '100%'}} 
                  onClick={() => onAddToCart(product, selectedSize)}
                  disabled={!selectedSize}
                >
                  { !selectedSize ? "Selecciona una talla" : "Añadir al Carrito" }
                </button>
              </div>
            </div>
        </div>
    );
};

const CheckoutPanel = ({ isOpen, onClose, onPaymentSuccess, cartTotal, publicKey, setIsProcessing, showToast }) => {
  // =========================================================================================
  // MODO DE PRODUCCIÓN: Se ha cambiado a 'false' para activar los pagos reales.
  // Esto hará que la aplicación llame al backend en '/api/create-payment'.
  // Asegúrate de desplegar la función de API y configurar MERCADOPAGO_ACCESS_TOKEN en Vercel.
  const IS_DEVELOPMENT = false;
  // =========================================================================================

  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const brickContainerRef = useRef(null);
  const brickInstance = useRef(null);

  useEffect(() => {
    const currentBrickInstance = brickInstance.current;
    
    if (isOpen && publicKey) {
      setIsInitializing(true);
      setInitializationError(null);

      if (!window.MercadoPago) {
        setInitializationError('El servicio de pago no está disponible en este momento. Por favor, refresca la página o intenta más tarde.');
        setIsInitializing(false);
        return;
      }
      
      if (brickContainerRef.current) {
        brickContainerRef.current.innerHTML = '';
      }

      const mp = new window.MercadoPago(publicKey, { locale: 'es-CO' });
      const bricksBuilder = mp.bricks();
      
      const renderPaymentBrick = async (builder) => {
        try {
            const settings = {
                initialization: { amount: cartTotal },
                customization: {
                    visual: { style: { theme: 'dark' } },
                    paymentMethods: { maxInstallments: 1 },
                },
                callbacks: {
                    onReady: () => {
                        setIsInitializing(false);
                    },
                    onSubmit: async (formData) => {
                        setIsProcessing(true);

                        if (IS_DEVELOPMENT) {
                            console.log("MODO DESARROLLO: Simulando pago exitoso.");
                            showToast('Modo de prueba: Simulando pago...');
                            setTimeout(() => {
                                const fakePaymentResult = {
                                    id: `dev_${Date.now()}`,
                                    status: 'approved',
                                    payment_method_id: 'visa',
                                    detail: 'approved',
                                    payer: {
                                        email: 'test.user@example.com',
                                        first_name: 'Usuario',
                                        last_name: 'de Prueba',
                                    }
                                };
                                onPaymentSuccess(fakePaymentResult);
                            }, 2000); // Simulate network delay
                            return;
                        }

                        try {
                            // La URL del backend es una ruta relativa que Vercel entenderá.
                            const backendUrl = '/api/create-payment'; 
                            
                            const response = await fetch(backendUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(formData)
                            });

                            const paymentResult = await response.json();

                            if (!response.ok) {
                                throw new Error(paymentResult.details || 'Error en el servidor de pagos.');
                            }
                            
                            if (paymentResult.status === 'approved') {
                                onPaymentSuccess(paymentResult);
                            } else {
                                throw new Error(`El pago fue rechazado: ${paymentResult.detail}`);
                            }

                        } catch (error) {
                            console.error("Error procesando el pago con el backend:", error);
                            let userMessage = 'No se pudo procesar el pago. Inténtalo de nuevo.';
                            if (error instanceof TypeError) { // This often means a network error or backend is down
                                userMessage = 'No se pudo conectar con el servidor de pagos. Por favor, contacta a soporte.';
                            } else if (error.message) {
                                userMessage = error.message;
                            }
                            showToast(userMessage, 'danger');
                            setIsProcessing(false);
                        }
                    },
                    onError: (error) => {
                        console.error("Mercado Pago Brick Error:", error);
                        setInitializationError('Hubo un error al procesar el pago. Revisa los datos de tu tarjeta e inténtalo de nuevo.');
                        setIsInitializing(false);
                    },
                },
            };
            if(brickContainerRef.current){
                const brick = await builder.create('payment', brickContainerRef.current.id, settings);
                brickInstance.current = brick;
            }
        } catch(error) {
            console.error("Failed to create Mercado Pago Brick:", error);
            setInitializationError('No se pudo cargar el formulario de pago. Revisa la consola para más detalles.');
            setIsInitializing(false);
        }
      };
      
      renderPaymentBrick(bricksBuilder);
    }

    return () => {
        if (currentBrickInstance) {
            try {
                currentBrickInstance.unmount();
                brickInstance.current = null;
            } catch (e) {
                console.error('Error unmounting Mercado Pago brick:', e);
            }
        }
    };
}, [isOpen, publicKey, cartTotal, onPaymentSuccess, setIsProcessing, showToast]);


  return (
    <div className={`checkout-panel ${isOpen ? 'open' : ''}`}>
      <button onClick={onClose} className="close-btn">&times;</button>
      <h3>Finalizar Compra</h3>
      <p style={{textAlign: 'center', margin: '10px 0 20px', fontSize: '1.2rem'}}>Total: <strong>{formatPrice(cartTotal)}</strong></p>
      
      {!publicKey ? (
        <div className="config-warning">
            <h4>Configuración Requerida</h4>
            <p>Para habilitar los pagos, el administrador debe configurar la "Public Key" de Mercado Pago en el Panel de Administración &gt; Seguridad.</p>
        </div>
      ) : isInitializing ? (
        <div className="payment-processing-overlay">
          <div className="spinner"></div>
          <p>Inicializando pago seguro...</p>
        </div>
      ) : initializationError ? (
        <div className="config-warning">
            <h4>Error al Cargar</h4>
            <p>{initializationError}</p>
            <button className="btn-primary" style={{marginTop: '15px'}} onClick={onClose}>Cerrar</button>
        </div>
      ) : (
        <>
            <div id="payment-brick-container" ref={brickContainerRef}></div>
            <p className="mercado-pago-disclaimer">
                {IS_DEVELOPMENT 
                    ? "Estás en modo de prueba. Se simulará un pago exitoso."
                    : "Estás en un entorno de prueba. Usa las tarjetas de prueba proporcionadas por Mercado Pago para completar la transacción."
                }
            </p>
        </>
      )}
    </div>
  );
};


const AdminPanel = ({ 
  isOpen, onClose, onLogout, theme, onThemeChange, onLogoChange, adminFormState, 
  onAdminFormChange, onAdminFormSubmit, onImageChange, onRemoveImage, resetAdminForm, 
  categories, products, editProduct, deleteProduct, onChangePassword, showToast,
  whatsappNumber, onWhatsAppChange, mercadoPagoPublicKey, setMercadoPagoPublicKey, 
  isAddingProduct, setIsAddingProduct, orders
}) => {
  const [passwordChange, setPasswordChange] = useState({ current: '', newPass: '', confirmPass: '' });
  const [activeTab, setActiveTab] = useState('appearance');

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordChange(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormSubmit = (e) => {
    e.preventDefault();
    if (!passwordChange.newPass || passwordChange.newPass !== passwordChange.confirmPass) {
      showToast('Las nuevas contraseñas no coinciden', 'danger');
      return;
    }
    const success = onChangePassword(passwordChange.current, passwordChange.newPass);
    if(success) {
      setPasswordChange({ current: '', newPass: '', confirmPass: '' });
    }
  };
  
  const formatDate = (isoString) => {
      const date = new Date(isoString);
      return date.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  };
  
  return (
    <div className={`admin-panel ${isOpen ? 'open' : ''}`}>
        <button onClick={onClose} className="close-btn">&times;</button>
        <h2>Panel de Administración</h2>
        
        <div className="admin-tabs">
            <button onClick={() => setActiveTab('appearance')} className={activeTab === 'appearance' ? 'active' : ''}>Apariencia</button>
            <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>Productos</button>
            <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'active' : ''}>Órdenes</button>
            <button onClick={() => setActiveTab('security')} className={activeTab === 'security' ? 'active' : ''}>Seguridad</button>
        </div>

        {activeTab === 'appearance' && (
          <div className="admin-section">
            <h3>Apariencia de la Tienda</h3>
            <form>
               <label>Nombre de la Marca:</label>
               <input type="text" name="brandName" value={theme.brandName} onChange={onThemeChange} />
               <label>Número de WhatsApp (con código de país):</label>
               <input type="text" name="whatsappNumber" value={whatsappNumber} onChange={onWhatsAppChange} placeholder="Ej: 573001234567" />
               <label>Logo:</label>
               <input type="file" accept="image/*" onChange={onLogoChange} />
               {theme.logoSrc && <img src={theme.logoSrc} alt="Logo Preview" className="image-preview"/>}
               <div className="color-picker-group">
                 <label>Color Primario:</label>
                 <input type="color" name="primaryColor" value={theme.primaryColor} onChange={onThemeChange} />
                 <label>Color Secundario:</label>
                 <input type="color" name="secondaryColor" value={theme.secondaryColor} onChange={onThemeChange} />
               </div>
                <div className="color-picker-group">
                 <label>Fondo:</label>
                 <input type="color" name="backgroundColor" value={theme.backgroundColor} onChange={onThemeChange} />
                 <label>Texto:</label>
                 <input type="color" name="textColor" value={theme.textColor} onChange={onThemeChange} />
               </div>
            </form>
          </div>
        )}
        
        {activeTab === 'security' && (
            <div className="admin-section">
              <h3>Seguridad</h3>
              <form onSubmit={handlePasswordFormSubmit} style={{marginBottom: '30px'}}>
                <h4>Cambiar Contraseña</h4>
                <input type="password" name="current" placeholder="Contraseña Actual" value={passwordChange.current} onChange={handlePasswordFormChange} required />
                <input type="password" name="newPass" placeholder="Nueva Contraseña" value={passwordChange.newPass} onChange={handlePasswordFormChange} required />
                <input type="password" name="confirmPass" placeholder="Confirmar Nueva Contraseña" value={passwordChange.confirmPass} onChange={handlePasswordFormChange} required />
                <button type="submit" className="btn-primary">Cambiar</button>
              </form>
              <div className="admin-section">
                <h3>Configuración de Pagos</h3>
                <label htmlFor="mp-public-key">Public Key de Mercado Pago</label>
                <input 
                    type="text" 
                    id="mp-public-key"
                    name="mercadoPagoPublicKey" 
                    placeholder="Pega tu Public Key aquí" 
                    value={mercadoPagoPublicKey} 
                    onChange={(e) => setMercadoPagoPublicKey(e.target.value)}
                />
                <p className="form-help-text">
                    Obtén esta clave de tu panel de desarrollador de Mercado Pago. Es necesaria para procesar pagos.
                </p>
              </div>
               <button onClick={onLogout} className="btn-secondary" style={{width: '100%', marginTop: '20px'}}>Cerrar Sesión</button>
            </div>
        )}
        
        {activeTab === 'products' && (
          <div className="admin-section">
            <h3>Gestión de Productos</h3>
            {isAddingProduct || adminFormState.id ? (
              <form onSubmit={onAdminFormSubmit}>
                <h4>{adminFormState.id ? 'Editar' : 'Añadir'} Producto</h4>
                <input type="text" name="name" placeholder="Nombre del Producto" value={adminFormState.name} onChange={onAdminFormChange} required />
                <input type="number" name="price" placeholder="Precio" value={adminFormState.price} onChange={onAdminFormChange} required />
                <input type="number" name="originalPrice" placeholder="Precio Original (para ofertas)" value={adminFormState.originalPrice} onChange={onAdminFormChange} />
                <textarea name="description" placeholder="Descripción" value={adminFormState.description} onChange={onAdminFormChange} required></textarea>
                <select name="category" value={adminFormState.category} onChange={onAdminFormChange} required>
                  <option value="">Seleccionar Categoría</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <textarea name="stock" placeholder="Stock (ej: S:10, M:5, L:0)" value={adminFormState.stock} onChange={onAdminFormChange} required rows={3}></textarea>
                <label>Imágenes del producto:</label>
                <input type="file" id="image-upload" accept="image/*" onChange={onImageChange} multiple />
                <div className="image-preview-container">
                    {adminFormState.images.map((img, index) => (
                        <div key={index} className="image-preview-item">
                            <img src={img} alt={`Preview ${index}`} className="image-preview"/>
                            <button type="button" onClick={() => onRemoveImage(index)}>&times;</button>
                        </div>
                    ))}
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                  <button type="submit" className="btn-primary">{adminFormState.id ? 'Actualizar' : 'Añadir'}</button>
                  <button type="button" className="btn-secondary" onClick={resetAdminForm}>Cancelar</button>
                </div>
              </form>
            ) : (
              <button className="btn-primary" style={{width: '100%'}} onClick={() => setIsAddingProduct(true)}>Añadir Nuevo Producto</button>
            )}
            <h3 style={{marginTop: '30px'}}>Productos Existentes</h3>
            <div className="admin-product-list">
              {products.map(p => (
                <div key={p.id} className="admin-product-item">
                  <div className="admin-product-item-info">
                     <img src={p.images[0]} alt={p.name} />
                     <span>{p.name} - {formatPrice(p.price)}</span>
                  </div>
                  <div className="admin-product-item-actions">
                    <button className="btn-edit" onClick={() => editProduct(p)}>Editar</button>
                    <button className="btn-delete" onClick={() => deleteProduct(p.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
            <div className="admin-section">
                <h3>Gestión de Órdenes</h3>
                <div className="admin-order-list">
                    {orders.length === 0 ? <p>No hay órdenes todavía.</p> :
                        orders.map(order => (
                            <div key={order.id} className="admin-order-item">
                                <div className="order-header">
                                    <strong>Orden: {order.id}</strong>
                                    <span>{formatDate(order.date)}</span>
                                </div>
                                <div className="order-customer">
                                    <p><strong>Cliente:</strong> {order.customer.name} ({order.customer.email})</p>
                                    <p><strong>Pago ID:</strong> {order.paymentId}</p>
                                    <p><strong>Método:</strong> {order.paymentMethod}</p>
                                </div>
                                <div className="order-items">
                                    <h4>Productos ({formatPrice(order.total)})</h4>
                                    <ul>
                                        {order.items.map(item => (
                                            <li key={`${item.id}-${item.size}`}>
                                               ({item.quantity}) {item.name} - Talla: {item.size}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        )}

        <div className="admin-section" style={{border: 'none', padding: 0, marginTop: '20px'}}>
             <button type="button" className="btn-secondary" style={{width: '100%'}} onClick={onClose}>Cerrar Panel</button>
        </div>
    </div>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);