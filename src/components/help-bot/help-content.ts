import {
  ActiveScreen,
  MasterTab,
  TesoreriaTab,
  UserRole,
} from '../../types/domain.types';

export interface HelpTopic {
  id: string;
  roles: UserRole[];
  category: string;
  question: string;
  summary: string;
  steps: string[];
  tips?: string[];
  targetScreen?: ActiveScreen;
  targetTab?: TesoreriaTab | MasterTab;
  actionButtonText?: string;
}

export const HELP_TOPICS: HelpTopic[] = [
  // ==========================================
  // ROL: CAJERO / VENDEDOR (CASHIER)
  // ==========================================
  {
    id: 'cashier-open-register',
    roles: ['CASHIER', 'MASTER'],
    category: 'Turno y Tesorería',
    question: '¿Cómo abrir mi caja para comenzar el turno de venta?',
    summary:
      'Para comenzar a cobrar en mostrador, el cajero debe declarar su saldo inicial de efectivo en caja.',
    steps: [
      'Diríjase a "Tesorería" en el menú o barra de navegación.',
      'Haga clic en la pestaña "Abrir Caja".',
      'Verifique que el Tipo de Caja sea "Ventas Sucursal" y que figure su sucursal de trabajo.',
      'Ingrese en el campo "Saldo Inicial en Efectivo ($)" el importe exacto de billetes para cambio en el cajón (ej. $15.000).',
      'Opcionalmente ingrese una observación del turno (ej. "Apertura turno mañana").',
      'Presione "Abrir Caja". La barra superior mostrará el indicador en verde confirmando que la caja está abierta y lista para facturar.',
    ],
    tips: [
      'No intente abrir dos cajas de ventas simultáneas; el sistema protege su usuario impidiendo duplicidades.',
    ],
    targetScreen: 'APERTURA_CAJA',
    targetTab: 'ABRIR_CAJA',
    actionButtonText: 'Ir a Abrir Caja',
  },
  {
    id: 'cashier-mp-qr',
    roles: ['CASHIER', 'MASTER'],
    category: 'Ventas y Cobros',
    question: '¿Cómo cobrar con código QR dinámico de Mercado Pago?',
    summary:
      'El sistema genera un código QR interoperable con el monto exacto de la venta y verificación automática en 3.5 segundos.',
    steps: [
      'En la pantalla "Nueva Venta", agregue los suplementos al carrito escaneando códigos de barra o buscando por SKU.',
      'En la sección "Forma de Pago", seleccione "QR mercado pago".',
      'Presione el botón "Guardar / Cobrar Venta".',
      'Se desplegará automáticamente el Modal de Cobro QR con el monto total en pesos y el código generado.',
      'Muestre la pantalla al cliente para que escanee con Mercado Pago, MODO, Cuenta DNI, BNA+ o cualquier billetera bancaria.',
      'El sistema sondea el estado cada 3.5 segundos. Al acreditarse, la pantalla se ilumina en verde con el aviso "¡Pago Acreditado!" y guarda el ticket automáticamente.',
      'Opción de respaldo: Si la red celular del cliente demora en responder pero mostró su comprobante en el teléfono, presione "Confirmar pago en mostrador".',
    ],
    tips: [
      'El cliente no necesita tipear el monto en su app; el QR ya codifica el total exacto a pagar.',
    ],
    targetScreen: 'NUEVA_VENTA',
    actionButtonText: 'Ir a Nueva Venta',
  },
  {
    id: 'cashier-offline-mode',
    roles: ['CASHIER', 'MASTER'],
    category: 'Contingencia y Red',
    question: '¿Qué hacer si se corta internet en el local? (Modo Offline Parcial)',
    summary:
      'JustiMobile cuenta con modo offline local-first para que las ventas no se detengan ante cortes de Wi-Fi o red 4G.',
    steps: [
      'Si se corta la conexión, la barra superior cambiará automáticamente a estado ámbar "OFFLINE".',
      'El catálogo de suplementos continúa accesible desde la memoria local del dispositivo.',
      'Agregue productos al carrito y cobre en Efectivo normalmente.',
      'Al presionar "Cobrar Venta", el sistema emite un comprobante provisional con formato OFF-YYYYMMDD-[HEX6].',
      'El importe cobrado actualiza el saldo de su turno para que el arqueo físico no pierda dinero.',
      'En cuanto vuelva la señal de internet, JustiMobile sincroniza las ventas en segundo plano con MongoDB Atlas de forma segura e idempotente.',
      'También puede pulsar el botón "Sincronizar ahora" en la barra superior para forzar el envío.',
    ],
    tips: [
      'Los cobros con QR dinámico requieren internet; si no hay red, cobre en efectivo mientras dure la contingencia.',
    ],
  },
  {
    id: 'cashier-crm-discount',
    roles: ['CASHIER', 'MASTER'],
    category: 'Ventas y Clientes',
    question: '¿Cómo aplicar un descuento CRM a un cliente registrado?',
    summary:
      'Los clientes fidelizados por el área de CRM pueden acceder a descuentos de un solo uso.',
    steps: [
      'En la vista "Nueva Venta", localice el campo de búsqueda de cliente.',
      'Escriba el nombre o correo del cliente y selecciónelo de la lista sugerida.',
      'Si el cliente tiene un beneficio asignado, aparecerá el cartel verde "XX% ACTIVO (1 solo uso)".',
      'Asegúrese de mantener tildada la casilla "Aplicar descuento CRM".',
      'El sistema descontará automáticamente el porcentaje del total a cobrar y lo marcará como consumido al guardar la venta.',
    ],
    tips: [
      'Si el cliente ya utilizó su descuento previamente, figurará como "Consumido". El área de CRM puede renovárselo cuando corresponda.',
    ],
    targetScreen: 'NUEVA_VENTA',
    actionButtonText: 'Ir a Nueva Venta',
  },
  {
    id: 'cashier-counter-expense',
    roles: ['CASHIER', 'MASTER'],
    category: 'Turno y Tesorería',
    question: '¿Cómo registrar un gasto menor de mostrador (cadetería, flete, insumos)?',
    summary:
      'Los pagos en efectivo realizados durante el turno deben declararse para que el arqueo de caja cuadre a la perfección.',
    steps: [
      'Diríjase a "Tesorería" ➔ pestaña "Nuevo Gasto".',
      'Ingrese el Importe exacto pagado en billetes.',
      'Seleccione la categoría correspondiente (Insumos y Limpieza, Logística / Flete, Gastos Varios).',
      'Escriba un detalle explicativo claro (ej. "Pago moto envío repuesto Pasteur").',
      'Presione "Guardar Gasto". El importe se restará del saldo de efectivo de su caja abierta.',
    ],
    targetScreen: 'APERTURA_CAJA',
    targetTab: 'NUEVO_GASTO',
    actionButtonText: 'Ir a Nuevo Gasto',
  },
  {
    id: 'cashier-close-register',
    roles: ['CASHIER', 'MASTER'],
    category: 'Turno y Tesorería',
    question: '¿Cómo realizar el arqueo y cierre de caja al finalizar la jornada?',
    summary:
      'Al terminar el turno de trabajo, el cajero debe conciliar el efectivo físico y cerrar su caja contable.',
    steps: [
      'Vaya a "Tesorería" ➔ pestaña "Cajas (Consulta)".',
      'Localice su caja con estado "ABIERTA" y presione el botón azul "Arqueo / Cerrar".',
      'El modal le mostrará el desglose de lo cobrado: Efectivo, Tarjetas, QR Mercado Pago, QR Sport Club y Canjes.',
      'El sistema calcula el Efectivo Teórico Esperado (Saldo Inicial + Ventas Efectivo - Gastos).',
      'Cuente los billetes y monedas que tiene físicamente en el cajón e ingrese el total en "Efectivo Físico Contado en Cajón ($)".',
      'Verifique la diferencia en vivo: Caja Cuadrada ($0.00), Sobrante (+) o Faltante (-).',
      'Ingrese notas aclaratorias si hubo diferencias y presione "Confirmar Cierre de Caja".',
      'Su turno quedará cerrado y su contador de ventas se reiniciará a $0.00 para la próxima jornada.',
    ],
    targetScreen: 'APERTURA_CAJA',
    targetTab: 'CAJAS',
    actionButtonText: 'Ir a Cajas de Tesorería',
  },

  // ==========================================
  // ROL: CRM (FIDELIZACIÓN Y CLIENTES)
  // ==========================================
  {
    id: 'crm-add-customer',
    roles: ['CRM', 'MASTER', 'ADMIN'],
    category: 'Fidelización CRM',
    question: '¿Cómo dar de alta un cliente con el selector de dominio (@gmail, etc.)?',
    summary:
      'El formulario asistido permite ingresar solo el usuario del correo y elegir el dominio de un enum para evitar errores tipográficos.',
    steps: [
      'Ingrese a "Clientes (CRM)" en el menú superior o barra de navegación.',
      'Presione el botón "+ Agregar Cliente".',
      'Escriba los Nombres y Apellidos del cliente (ej. Alejandro Briozzo).',
      'En el campo de correo, ingrese únicamente el nombre de usuario (ej. ale.briozzo).',
      'En el menú desplegable adyacente, elija el dominio: @gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com o seleccione "Otro dominio...".',
      'Verifique el campo bloqueado inferior que muestra en tiempo real el correo unificado completo con la insignia "Formato Válido".',
      'Seleccione el descuento promocional tocando cualquiera de los botones rápidos (5%, 10%, 15%, 20%, 25%) o tipee un valor personalizado.',
      'Presione "Guardar Cliente". El cliente quedará registrado con fecha y hora automática.',
    ],
    tips: [
      'Si copia y pega un email completo con "@", el sistema lo detecta y separa el usuario y dominio automáticamente.',
    ],
    targetScreen: 'CLIENTES',
    actionButtonText: 'Ir a Clientes CRM',
  },
  {
    id: 'crm-renew-discount',
    roles: ['CRM', 'MASTER', 'ADMIN'],
    category: 'Fidelización CRM',
    question: '¿Cómo renovar o reasignar el descuento a un cliente recurrente?',
    summary:
      'Cuando un cliente habitual ya utilizó su descuento en caja, el área de CRM puede otorgarle un nuevo beneficio.',
    steps: [
      'En la pantalla "Clientes (CRM)", busque al cliente por su nombre o correo en el buscador.',
      'Haga clic en el botón "Editar % CRM" (ícono de lápiz) de la fila del cliente.',
      'Seleccione el nuevo porcentaje promocional con los botones de acceso rápido (5%, 10%, 15%, 20%, 25%) o tipee el valor deseado.',
      'Presione "Guardar Cliente".',
      'El beneficio pasará inmediatamente a estado ACTIVO para que el cajero lo aplique en su próxima compra en el mostrador.',
    ],
    targetScreen: 'CLIENTES',
    actionButtonText: 'Ir a Clientes CRM',
  },
  {
    id: 'crm-export-report',
    roles: ['CRM', 'MASTER', 'ADMIN'],
    category: 'Fidelización CRM',
    question: '¿Cómo generar y exportar el informe de clientes a Excel o PDF?',
    summary:
      'Permite auditar el padrón de clientes fidelizados bajo la marca Ultra Tech Carreras.',
    steps: [
      'En la vista "Clientes (CRM)", presione el botón "Informe CRM".',
      'Seleccione los filtros deseados: rango de fechas (Desde / Hasta) y criterio de ordenamiento.',
      'Presione "Excel (CSV)" para descargar una planilla estructurada con cabecera de Ultra Tech Carreras.',
      'O presione "Imprimir / PDF" para abrir la vista imprimible con métricas de clientes activos y promedio de descuentos.',
    ],
    targetScreen: 'CLIENTES',
    actionButtonText: 'Abrir Clientes CRM',
  },
  {
    id: 'crm-permissions',
    roles: ['CRM'],
    category: 'Reglas del Sistema',
    question: '¿Por qué el usuario CRM no puede ingresar a ventas ni abrir cajas?',
    summary:
      'Por seguridad contable y auditoría, el sistema aplica el principio de menor privilegio (RBAC).',
    steps: [
      'El perfil CRM está dedicado 100% a la fidelización de clientes y asignación de descuentos.',
      'Para evitar conflictos de interés contables, los operadores CRM no pueden cobrar ventas ni registrar egresos de dinero.',
      'La facturación en mostrador es potestad exclusiva de los cajeros con caja habilitada.',
    ],
  },

  // ==========================================
  // ROL: ADMINISTRADOR (ADMIN)
  // ==========================================
  {
    id: 'admin-bi-dashboard',
    roles: ['ADMIN', 'MASTER'],
    category: 'Inteligencia de Negocios (BI)',
    question: '¿Cómo utilizar el Dashboard de Inteligencia de Negocios (BI)?',
    summary:
      'Consola gerencial para analizar ventas, tendencias temporales, mix de pagos y productividad.',
    steps: [
      'Al iniciar sesión como Administrador, accederá directamente al Dashboard BI (o haga clic en "Dashboard BI" en la barra superior).',
      'Utilice los filtros temporales: "Hoy", "7 Días", "30 Días" o "Histórico".',
      'Utilice el selector de sucursal para comparar "Todas las Sucursales", "LOCALES" o "CARRERAS".',
      'Revise los KPIs ejecutivos: Facturación Neta, Ticket Promedio (AOV), Flujo Operativo Neto y Adopción CRM.',
      'Examine el Gráfico de Tendencia Diaria con barras de colores por sucursal (Azul LOCALES vs Púrpura CARRERAS).',
      'Consulte el Mix de Cobranza (Efectivo, QR Mercado Pago, Tarjetas, Sport Club) y el Ranking de Suplementos Más Vendidos.',
      'Presione "Exportar Excel" en la esquina superior para descargar el reporte ejecutivo en CSV.',
    ],
    targetScreen: 'BIENVENIDO',
    actionButtonText: 'Ir al Dashboard BI',
  },
  {
    id: 'admin-force-close-box',
    roles: ['ADMIN', 'MASTER'],
    category: 'Supervisión de Cajas',
    question: '¿Cómo cerrar administrativamente la caja de un vendedor que olvidó hacerlo?',
    summary:
      'El Administrador tiene facultad para arquear y cerrar cajas abiertas de cualquier operador de forma remota.',
    steps: [
      'En el Dashboard BI, cambie a la pestaña "Cajas Activas & Egresos" (o diríjase a Tesorería ➔ Cajas).',
      'Localice la tarjeta del cajero en turno que requiere cierre.',
      'Haga clic en el botón azul "Cerrar Caja".',
      'Confirme la operación en el diálogo de seguridad.',
      'El sistema congela el turno de la caja en estado CERRADA y reinicia el contador de ventas del cajero.',
    ],
    targetScreen: 'APERTURA_CAJA',
    targetTab: 'CAJAS',
    actionButtonText: 'Ir a Auditoría de Cajas',
  },
  {
    id: 'admin-catalog-prices',
    roles: ['ADMIN', 'MASTER'],
    category: 'Catálogo y Precios',
    question: '¿Cómo modificar precios de venta o dar de alta nuevos productos?',
    summary:
      'El Administrador gestiona el catálogo oficial y la lista de precios de Ultra Tech Carreras.',
    steps: [
      'Haga clic en "Productos" en la barra superior o en el botón "Catálogo y Precios" del panel.',
      'Para modificar un precio: busque el artículo por Nombre o SKU, presione el botón azul "Precio", tipee el nuevo valor en pesos ($) y presione "Guardar Precio". El cambio impacta inmediatamente en el POS.',
      'Para nuevo producto: presione "+ Nuevo Producto", complete nombre, SKU, código de barras (EAN), precio, costo y stock mínimo, y presione "Guardar Producto".',
      'Para desactivar un artículo descontinuado: presione el botón de encendido (Power) en la fila correspondiente.',
    ],
    targetScreen: 'PRODUCTOS',
    actionButtonText: 'Ir a Catálogo de Productos',
  },
  {
    id: 'admin-assign-branch',
    roles: ['ADMIN', 'MASTER'],
    category: 'Operadores y Personal',
    question: '¿Cómo asignar o cambiar la sucursal de un cajero o usuario CRM?',
    summary:
      'Los cajeros y CRM tienen su sucursal bloqueada; solo el Administrador puede reasignarla.',
    steps: [
      'Haga clic en "Operadores" en la barra superior.',
      'Localice al usuario en la tabla de operadores.',
      'En la columna "Sucursal Asignada", abra el menú desplegable y seleccione "LOCALES" o "CARRERAS".',
      'El cambio se persiste en tiempo real en MongoDB Atlas.',
    ],
    targetScreen: 'USUARIOS',
    actionButtonText: 'Ir a Gestión de Operadores',
  },
  {
    id: 'admin-sales-audit',
    roles: ['ADMIN', 'MASTER'],
    category: 'Auditoría Comercial',
    question: '¿Cómo auditar las ventas por vendedor y exportar a Excel?',
    summary:
      'Permite conciliar tickets, productos despachados y descuentos aplicados por cada cajero.',
    steps: [
      'Diríjase a "Ventas-Cobros" ➔ "Ventas por Usuario".',
      'Filtre por vendedor específico o audite todos los cajeros.',
      'Utilice el buscador para localizar comprobantes específicos por folio o cliente.',
      'Presione "Exportar a Excel" para descargar el archivo CSV conciliatorio.',
    ],
    targetScreen: 'VENTAS_USUARIOS',
    actionButtonText: 'Ir a Ventas por Usuario',
  },

  // ==========================================
  // ROL: MASTER (SUPERADMINISTRADOR)
  // ==========================================
  {
    id: 'master-companies',
    roles: ['MASTER'],
    category: 'Multi-Tenant & Marca',
    question: '¿Cómo dar de alta empresas y personalizar el logotipo en vivo?',
    summary:
      'El rol Master puede crear y administrar empresas con su CUIT, razón social y logotipo independiente.',
    steps: [
      'Diríjase a "Control Master" ➔ pestaña "Empresas & Marca".',
      'En la tarjeta "Gestión de Empresas", presione "Nueva Empresa".',
      'Complete la Razón Social, CUIT, Email de contacto y enlace al logotipo SVG/PNG.',
      'En la sección superior "Personalización de Marca", puede cambiar el logotipo y el nombre visible en tiempo real.',
    ],
    targetScreen: 'MASTER_CONTROL',
    targetTab: 'EMPRESAS',
    actionButtonText: 'Ir a Empresas & Marca',
  },
  {
    id: 'master-killswitch',
    roles: ['MASTER'],
    category: 'Seguridad y Contingencia',
    question: '¿Cómo utilizar el Kill-Switch de emergencia para pausar ventas o CRM?',
    summary:
      'Permite congelar módulos del sistema en menos de 50 milisegundos ante auditorías o contingencias.',
    steps: [
      'Haga clic en "Control Master" ➔ pestaña "Seguridad & APIs".',
      'En la tarjeta "Configuración Global & Kill-Switch", active el interruptor "Pausar Módulo POS" o "Pausar Módulo CRM".',
      'Escriba el motivo visible para los operadores (ej. "Cierre de inventario fiscal").',
      'Los cajeros que intenten crear ventas recibirán un bloqueo automático.',
      'Para restablecer el servicio normal, simplemente desactive los interruptores.',
    ],
    targetScreen: 'MASTER_CONTROL',
    targetTab: 'SEGURIDAD',
    actionButtonText: 'Ir a Seguridad & APIs',
  },
  {
    id: 'master-mercadopago',
    roles: ['MASTER'],
    category: 'Integraciones Bancarias',
    question: '¿Cómo administrar y probar las credenciales de Mercado Pago?',
    summary:
      'La administración de claves secretas de pasarelas de pago es potestad 100% exclusiva del usuario MASTER.',
    steps: [
      'En "Control Master" ➔ pestaña "Integraciones (MP / AFIP)".',
      'Localice la tarjeta "Pasarela Mercado Pago (QR Dinámico & APIs de Cobro)".',
      'Active el interruptor general y seleccione "Modo Sandbox (Pruebas)" o "Modo Producción".',
      'Pegue el Access Token (APP_USR-... o TEST-...) y la Public Key.',
      'Presione el botón "Probar Conexión con Mercado Pago" para validar las claves en vivo contra api.mercadopago.com/users/me.',
      'Si la cuenta es válida, aparecerá una insignia verde de verificación con el titular de la cuenta.',
      'Presione "Guardar Configuración". Los tokens se persisten bajo enmascaramiento Zero-Knowledge (APP_USR-****-****-****-a1b2).',
    ],
    targetScreen: 'MASTER_CONTROL',
    targetTab: 'INTEGRACIONES',
    actionButtonText: 'Ir a Integraciones MP / AFIP',
  },
  {
    id: 'master-api-keys',
    roles: ['MASTER'],
    category: 'Integraciones Externas',
    question: '¿Cómo generar o revocar API Keys para sistemas externos?',
    summary:
      'Permite conectar sistemas de e-commerce, ERP o terminales remotas mediante autenticación por cabecera x-api-key.',
    steps: [
      'En "Control Master" ➔ pestaña "Seguridad & APIs".',
      'En la tarjeta "Generador de API Keys Externas", presione "Crear API Key".',
      'Asigne un nombre identificador y seleccione los scopes permitidos (crm:write, catalog:read, etc.).',
      'Copie la llave privada generada en ese instante, ya que por seguridad criptográfica nunca vuelve a mostrarse completa.',
      'Para dar de baja una integración, localice la llave en la tabla y presione "Revocar".',
    ],
    targetScreen: 'MASTER_CONTROL',
    targetTab: 'SEGURIDAD',
    actionButtonText: 'Ir a Seguridad & APIs',
  },
];
