# 📱 FasoMarket Mobile Client Flutter - Spécifications Complètes

## 🎯 Vue d'Ensemble
Application mobile Flutter (iOS + Android) pour les clients FasoMarket, utilisant le même backend Spring Boot que la version web.

## 🏗️ Architecture Technique Flutter

### Stack Flutter Recommandée
- **Framework**: Flutter 3.16+
- **Language**: Dart 3.0+
- **State Management**: Bloc/Cubit + Hydrated Bloc
- **Navigation**: GoRouter
- **UI Framework**: Material 3 + Custom Design System
- **HTTP Client**: Dio + Retrofit
- **Local Storage**: Hive + Secure Storage
- **Maps**: Google Maps Flutter
- **Notifications**: Firebase Cloud Messaging
- **Camera**: Image Picker
- **Payments**: Custom integration Orange Money, Moov Money

### Structure Projet Flutter
```
lib/
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── theme/
│   └── utils/
├── data/
│   ├── datasources/
│   ├── models/
│   └── repositories/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
├── presentation/
│   ├── bloc/
│   ├── pages/
│   ├── widgets/
│   └── routes/
└── main.dart
```

### Configuration API Flutter
```dart
class ApiConfig {
  static const String baseUrl = 'https://api.fasomarket.bf';
  static const String devUrl = 'http://192.168.1.100:8081';
  static const int timeout = 10000;
  
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'User-Agent': 'FasoMarket-Flutter/1.0.0',
    'X-Platform': 'mobile',
  };
}

// Dio Configuration
class DioClient {
  late Dio _dio;
  
  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: Duration(milliseconds: ApiConfig.timeout),
      receiveTimeout: Duration(milliseconds: ApiConfig.timeout),
      headers: ApiConfig.headers,
    ));
    
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(LogInterceptor());
  }
}
```

## 📱 Navigation Flutter avec GoRouter

### Route Configuration
```dart
final GoRouter router = GoRouter(
  initialLocation: '/splash',
  routes: [
    // Auth Routes
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    
    // Main App Shell
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        // Home Tab
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
          routes: [
            GoRoute(
              path: '/product/:id',
              builder: (context, state) => ProductDetailScreen(
                productId: state.pathParameters['id']!,
              ),
            ),
            GoRoute(
              path: '/shop/:id',
              builder: (context, state) => ShopDetailScreen(
                shopId: state.pathParameters['id']!,
              ),
            ),
          ],
        ),
        
        // Search Tab
        GoRoute(
          path: '/search',
          builder: (context, state) => const SearchScreen(),
        ),
        
        // Cart Tab
        GoRoute(
          path: '/cart',
          builder: (context, state) => const CartScreen(),
          routes: [
            GoRoute(
              path: '/checkout',
              builder: (context, state) => const CheckoutScreen(),
            ),
            GoRoute(
              path: '/payment',
              builder: (context, state) => const PaymentScreen(),
            ),
          ],
        ),
        
        // Profile Tab
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
          routes: [
            GoRoute(
              path: '/orders',
              builder: (context, state) => const OrdersScreen(),
            ),
            GoRoute(
              path: '/order/:id',
              builder: (context, state) => OrderDetailScreen(
                orderId: state.pathParameters['id']!,
              ),
            ),
            GoRoute(
              path: '/addresses',
              builder: (context, state) => const AddressesScreen(),
            ),
            GoRoute(
              path: '/favorites',
              builder: (context, state) => const FavoritesScreen(),
            ),
          ],
        ),
      ],
    ),
  ],
);
```

### Bottom Navigation Shell
```dart
class MainShell extends StatelessWidget {
  final Widget child;
  
  const MainShell({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: FMColors.primary,
        unselectedItemColor: FMColors.textSecondary,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search_outlined),
            activeIcon: Icon(Icons.search),
            label: 'Recherche',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart_outlined),
            activeIcon: Icon(Icons.shopping_cart),
            label: 'Panier',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
        onTap: (index) => _onTabTapped(context, index),
      ),
    );
  }
}
```

## 🎨 Design System Flutter

### Theme Configuration
```dart
class FMTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: FMColors.primary,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: FMColors.text,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: FMColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: FMColors.textSecondary),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: FMColors.primary, width: 2),
        ),
      ),
    );
  }
}

class FMColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color secondary = Color(0xFF2ECC71);
  static const Color accent = Color(0xFF3498DB);
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color text = Color(0xFF2C3E50);
  static const Color textSecondary = Color(0xFF7F8C8D);
  static const Color error = Color(0xFFE74C3C);
  static const Color warning = Color(0xFFF39C12);
  static const Color success = Color(0xFF27AE60);
}
```

### Custom Widgets
```dart
// Custom Button
class FMButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final FMButtonType type;
  final bool isLoading;
  
  const FMButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.type = FMButtonType.primary,
    this.isLoading = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: _getButtonStyle(),
        child: isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

// Product Card
class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;
  final VoidCallback? onFavorite;
  
  const ProductCard({
    Key? key,
    required this.product,
    this.onTap,
    this.onFavorite,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image avec badge favori
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  child: CachedNetworkImage(
                    imageUrl: product.images ?? '',
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => const FMShimmer(),
                    errorWidget: (context, url, error) => Container(
                      height: 150,
                      color: Colors.grey[200],
                      child: const Icon(Icons.image_not_supported),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: IconButton(
                    onPressed: onFavorite,
                    icon: Icon(
                      product.isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: product.isFavorite ? Colors.red : Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            
            // Informations produit
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${product.price.toStringAsFixed(0)} FCFA',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: FMColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.star, size: 16, color: Colors.amber),
                      Text(
                        ' ${product.rating?.toStringAsFixed(1) ?? '0.0'}',
                        style: TextStyle(
                          fontSize: 12,
                          color: FMColors.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        product.shopName ?? '',
                        style: TextStyle(
                          fontSize: 12,
                          color: FMColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 📱 Écrans Flutter Détaillés

### 🏠 Home Screen
```dart
class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeCubit, HomeState>(
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Image.asset('assets/images/logo.png', height: 32),
            actions: [
              IconButton(
                icon: Stack(
                  children: [
                    const Icon(Icons.notifications_outlined),
                    if (state.notificationCount > 0)
                      Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 16,
                            minHeight: 16,
                          ),
                          child: Text(
                            '${state.notificationCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                  ],
                ),
                onPressed: () => context.push('/notifications'),
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () => context.read<HomeCubit>().refresh(),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Barre de recherche
                  _buildSearchBar(),
                  
                  // Bannière promotionnelle
                  _buildPromoBanner(state.banners),
                  
                  // Catégories
                  _buildCategoriesSection(state.categories),
                  
                  // Produits tendance
                  _buildTrendingProducts(state.trendingProducts),
                  
                  // Boutiques populaires
                  _buildPopularShops(state.popularShops),
                  
                  // Nouveautés
                  _buildNewProducts(state.newProducts),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSearchBar() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Rechercher des produits...',
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(25),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.grey[100],
        ),
        onTap: () => context.push('/search'),
        readOnly: true,
      ),
    );
  }

  Widget _buildPromoBanner(List<Banner> banners) {
    return Container(
      height: 180,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: PageView.builder(
        itemCount: banners.length,
        itemBuilder: (context, index) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
              imageUrl: banners[index].imageUrl,
              fit: BoxFit.cover,
              placeholder: (context, url) => const FMShimmer(),
            ),
          );
        },
      ),
    );
  }
}
```

### 🔍 Search Screen
```dart
class SearchScreen extends StatefulWidget {
  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchCubit, SearchState>(
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: TextField(
              controller: _searchController,
              focusNode: _searchFocus,
              decoration: const InputDecoration(
                hintText: 'Rechercher...',
                border: InputBorder.none,
              ),
              onSubmitted: (query) {
                context.read<SearchCubit>().search(query);
              },
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.tune),
                onPressed: () => _showFilters(context),
              ),
            ],
          ),
          body: Column(
            children: [
              // Filtres rapides
              _buildQuickFilters(state.activeFilters),
              
              // Résultats
              Expanded(
                child: state.isLoading
                    ? const FMLoader()
                    : state.results.isEmpty
                        ? _buildEmptyState()
                        : _buildResults(state.results),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildResults(List<Product> products) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        return ProductCard(
          product: products[index],
          onTap: () => context.push('/product/${products[index].id}'),
          onFavorite: () => context.read<SearchCubit>().toggleFavorite(products[index]),
        );
      },
    );
  }
}
```

### 🛒 Cart Screen
```dart
class CartScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Text('Mon Panier (${state.items.length})'),
            actions: [
              if (state.items.isNotEmpty)
                TextButton(
                  onPressed: () => context.read<CartCubit>().clearCart(),
                  child: const Text('Vider'),
                ),
            ],
          ),
          body: state.items.isEmpty
              ? _buildEmptyCart()
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        itemCount: state.items.length,
                        itemBuilder: (context, index) {
                          return CartItemWidget(
                            item: state.items[index],
                            onQuantityChanged: (quantity) {
                              context.read<CartCubit>().updateQuantity(
                                state.items[index].id,
                                quantity,
                              );
                            },
                            onRemove: () {
                              context.read<CartCubit>().removeItem(state.items[index].id);
                            },
                          );
                        },
                      ),
                    ),
                    _buildCartSummary(state),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildCartSummary(CartState state) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Sous-total:', style: TextStyle(fontSize: 16)),
              Text(
                '${state.subtotal.toStringAsFixed(0)} FCFA',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Livraison:', style: TextStyle(fontSize: 16)),
              Text(
                '${state.deliveryFee.toStringAsFixed(0)} FCFA',
                style: const TextStyle(fontSize: 16),
              ),
            ],
          ),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text(
                '${state.total.toStringAsFixed(0)} FCFA',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: FMColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          FMButton(
            text: 'Passer la commande',
            onPressed: () => context.push('/cart/checkout'),
          ),
        ],
      ),
    );
  }
}
```

## 🔗 API Integration Flutter

### Models
```dart
// Product Model
@JsonSerializable()
class Product {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String? images;
  final String category;
  final double? rating;
  final int? reviewsCount;
  final String? shopName;
  final String? shopId;
  final bool available;
  final int stockQuantity;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.images,
    required this.category,
    this.rating,
    this.reviewsCount,
    this.shopName,
    this.shopId,
    required this.available,
    required this.stockQuantity,
  });

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);
}

// Order Model
@JsonSerializable()
class Order {
  final String id;
  final String numero;
  final String statut;
  final double total;
  final DateTime dateCreation;
  final String clientNom;
  final String? clientTelephone;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.numero,
    required this.statut,
    required this.total,
    required this.dateCreation,
    required this.clientNom,
    this.clientTelephone,
    required this.items,
  });

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
  Map<String, dynamic> toJson() => _$OrderToJson(this);
}
```

### API Service
```dart
@RestApi(baseUrl: ApiConfig.baseUrl)
abstract class FasoMarketApi {
  factory FasoMarketApi(Dio dio, {String baseUrl}) = _FasoMarketApi;

  // Auth
  @POST('/api/auth/connexion')
  Future<AuthResponse> login(@Body() LoginRequest request);

  @POST('/api/auth/inscription-client')
  Future<AuthResponse> register(@Body() RegisterRequest request);

  @GET('/api/auth/profil')
  Future<User> getProfile(@Header('X-User-Id') String userId);

  // Products
  @GET('/api/public/accueil')
  Future<HomeResponse> getHomeData();

  @GET('/api/public/produits')
  Future<List<Product>> getProducts({
    @Query('page') int page = 0,
    @Query('size') int size = 20,
    @Query('categorie') String? category,
    @Query('prixMin') double? minPrice,
    @Query('prixMax') double? maxPrice,
    @Query('q') String? query,
  });

  @GET('/api/public/produits/{id}')
  Future<Product> getProduct(@Path('id') String id);

  @GET('/api/public/recherche')
  Future<SearchResponse> search(@Query('q') String query);

  // Cart
  @GET('/api/client/panier')
  Future<List<CartItem>> getCart(@Header('X-User-Id') String userId);

  @POST('/api/client/panier/ajouter')
  Future<void> addToCart(
    @Header('X-User-Id') String userId,
    @Body() AddToCartRequest request,
  );

  @DELETE('/api/client/panier/{itemId}')
  Future<void> removeFromCart(
    @Header('X-User-Id') String userId,
    @Path('itemId') String itemId,
  );

  // Orders
  @GET('/api/client/commandes')
  Future<List<Order>> getOrders(@Header('X-User-Id') String userId);

  @GET('/api/client/commandes/{id}')
  Future<Order> getOrder(
    @Header('X-User-Id') String userId,
    @Path('id') String orderId,
  );

  @POST('/api/client/commandes/creer')
  Future<Order> createOrder(
    @Header('X-User-Id') String userId,
    @Body() CreateOrderRequest request,
  );

  @PUT('/api/client/commandes/{id}/annuler')
  Future<void> cancelOrder(
    @Header('X-User-Id') String userId,
    @Path('id') String orderId,
  );

  // Payment
  @GET('/api/client/paiement/modes')
  Future<List<PaymentMethod>> getPaymentMethods();

  @POST('/api/client/paiement/simuler')
  Future<PaymentResponse> simulatePayment(
    @Header('X-User-Id') String userId,
    @Body() PaymentRequest request,
  );

  // Favorites
  @GET('/api/client/favoris')
  Future<List<Product>> getFavorites(@Header('X-User-Id') String userId);

  @POST('/api/client/favoris/ajouter')
  Future<void> addToFavorites(
    @Header('X-User-Id') String userId,
    @Body() Map<String, String> request,
  );

  @DELETE('/api/client/favoris/{productId}')
  Future<void> removeFromFavorites(
    @Header('X-User-Id') String userId,
    @Path('productId') String productId,
  );

  // Notifications
  @GET('/api/client/notifications')
  Future<List<Notification>> getNotifications(@Header('X-User-Id') String userId);

  @GET('/api/client/notifications/compteur')
  Future<NotificationCount> getNotificationCount(@Header('X-User-Id') String userId);

  @PUT('/api/client/notifications/{id}/lue')
  Future<void> markNotificationAsRead(
    @Header('X-User-Id') String userId,
    @Path('id') String notificationId,
  );
}
```

### Repository Implementation
```dart
class ProductRepository {
  final FasoMarketApi _api;
  final HiveInterface _hive;

  ProductRepository(this._api, this._hive);

  Future<List<Product>> getProducts({
    int page = 0,
    int size = 20,
    String? category,
    double? minPrice,
    double? maxPrice,
    String? query,
  }) async {
    try {
      final products = await _api.getProducts(
        page: page,
        size: size,
        category: category,
        minPrice: minPrice,
        maxPrice: maxPrice,
        query: query,
      );
      
      // Cache products locally
      await _cacheProducts(products);
      
      return products;
    } catch (e) {
      // Return cached products if network fails
      return await _getCachedProducts();
    }
  }

  Future<void> _cacheProducts(List<Product> products) async {
    final box = await _hive.openBox<Product>('products');
    for (final product in products) {
      await box.put(product.id, product);
    }
  }

  Future<List<Product>> _getCachedProducts() async {
    final box = await _hive.openBox<Product>('products');
    return box.values.toList();
  }
}
```

## 🔔 Notifications Push Flutter

### Firebase Configuration
```dart
class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    // Request permission
    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Initialize local notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _localNotifications.initialize(initSettings);

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification taps
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
  }

  Future<String?> getToken() async {
    return await _messaging.getToken();
  }

  void _handleForegroundMessage(RemoteMessage message) {
    _showLocalNotification(message);
  }

  void _handleNotificationTap(RemoteMessage message) {
    final data = message.data;
    final type = data['type'];
    
    switch (type) {
      case 'order_update':
        // Navigate to order details
        GetIt.instance<GoRouter>().push('/order/${data['orderId']}');
        break;
      case 'new_product':
        // Navigate to product details
        GetIt.instance<GoRouter>().push('/product/${data['productId']}');
        break;
      default:
        // Navigate to notifications
        GetIt.instance<GoRouter>().push('/notifications');
    }
  }

  Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'fasomarket_channel',
      'FasoMarket Notifications',
      channelDescription: 'Notifications from FasoMarket',
      importance: Importance.high,
      priority: Priority.high,
    );
    
    const iosDetails = DarwinNotificationDetails();
    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      details,
      payload: jsonEncode(message.data),
    );
  }
}
```

## 💳 Paiement Mobile Money Flutter

### Orange Money Integration
```dart
class OrangeMoneyService {
  static const String _baseUrl = 'https://api.orange.com/orange-money-webpay/dev/v1';
  
  Future<PaymentResponse> initiatePayment({
    required String amount,
    required String phoneNumber,
    required String orderId,
  }) async {
    try {
      // Simulate Orange Money API call
      await Future.delayed(const Duration(seconds: 2));
      
      // 90% success rate for simulation
      final isSuccess = Random().nextDouble() > 0.1;
      
      if (isSuccess) {
        return PaymentResponse(
          status: 'SUCCESS',
          transactionId: 'OM_${DateTime.now().millisecondsSinceEpoch}',
          message: 'Paiement effectué avec succès',
        );
      } else {
        return PaymentResponse(
          status: 'FAILED',
          message: 'Paiement échoué. Vérifiez votre solde.',
          errorCode: 'INSUFFICIENT_FUNDS',
        );
      }
    } catch (e) {
      return PaymentResponse(
        status: 'ERROR',
        message: 'Erreur de connexion',
        errorCode: 'NETWORK_ERROR',
      );
    }
  }
}

class MoovMoneyService {
  Future<PaymentResponse> initiatePayment({
    required String amount,
    required String phoneNumber,
    required String orderId,
  }) async {
    // Similar implementation for Moov Money
    await Future.delayed(const Duration(seconds: 2));
    
    final isSuccess = Random().nextDouble() > 0.1;
    
    if (isSuccess) {
      return PaymentResponse(
        status: 'SUCCESS',
        transactionId: 'MM_${DateTime.now().millisecondsSinceEpoch}',
        message: 'Paiement Moov Money réussi',
      );
    } else {
      return PaymentResponse(
        status: 'FAILED',
        message: 'Échec du paiement Moov Money',
        errorCode: 'PAYMENT_DECLINED',
      );
    }
  }
}
```

### Payment Screen
```dart
class PaymentScreen extends StatefulWidget {
  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  PaymentMethod? selectedMethod;
  final phoneController = TextEditingController();
  bool isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Paiement')),
      body: BlocBuilder<PaymentCubit, PaymentState>(
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Payment methods
                ...state.paymentMethods.map((method) => 
                  PaymentMethodTile(
                    method: method,
                    isSelected: selectedMethod?.id == method.id,
                    onTap: () => setState(() => selectedMethod = method),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Phone number input (for mobile money)
                if (selectedMethod?.id != 'CASH_ON_DELIVERY')
                  TextField(
                    controller: phoneController,
                    decoration: const InputDecoration(
                      labelText: 'Numéro de téléphone',
                      hintText: '+226 XX XX XX XX',
                      prefixIcon: Icon(Icons.phone),
                    ),
                    keyboardType: TextInputType.phone,
                  ),
                
                const Spacer(),
                
                // Order summary
                _buildOrderSummary(state.orderTotal),
                
                const SizedBox(height: 16),
                
                // Pay button
                FMButton(
                  text: 'Payer ${state.orderTotal.toStringAsFixed(0)} FCFA',
                  onPressed: selectedMethod != null ? _processPayment : null,
                  isLoading: isProcessing,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _processPayment() async {
    if (selectedMethod == null) return;
    
    setState(() => isProcessing = true);
    
    try {
      final result = await context.read<PaymentCubit>().processPayment(
        method: selectedMethod!,
        phoneNumber: phoneController.text,
      );
      
      if (result.status == 'SUCCESS') {
        _showSuccessDialog(result);
      } else {
        _showErrorDialog(result.message);
      }
    } catch (e) {
      _showErrorDialog('Erreur lors du paiement');
    } finally {
      setState(() => isProcessing = false);
    }
  }

  void _showSuccessDialog(PaymentResponse result) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 64),
        title: const Text('Paiement réussi !'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Transaction ID: ${result.transactionId}'),
            const SizedBox(height: 8),
            Text(result.message),
          ],
        ),
        actions: [
          FMButton(
            text: 'Voir ma commande',
            onPressed: () {
              Navigator.of(context).pop();
              context.push('/orders');
            },
          ),
        ],
      ),
    );
  }
}
```

## 📱 Fonctionnalités Mobiles Spécifiques Flutter

### Géolocalisation
```dart
class LocationService {
  Future<Position?> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return null;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return null;
      }
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  Future<String> getAddressFromCoordinates(double lat, double lng) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        return '${place.street}, ${place.locality}, ${place.country}';
      }
    } catch (e) {
      print('Error getting address: $e');
    }
    return 'Adresse inconnue';
  }
}
```

### Camera/Image Picker
```dart
class ImageService {
  final ImagePicker _picker = ImagePicker();

  Future<XFile?> pickImageFromCamera() async {
    try {
      return await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 80,
      );
    } catch (e) {
      print('Error picking image from camera: $e');
      return null;
    }
  }

  Future<XFile?> pickImageFromGallery() async {
    try {
      return await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 80,
      );
    } catch (e) {
      print('Error picking image from gallery: $e');
      return null;
    }
  }

  Future<String?> uploadImage(XFile image) async {
    try {
      final dio = GetIt.instance<Dio>();
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          image.path,
          filename: image.name,
        ),
      });

      final response = await dio.post('/api/upload/image', data: formData);
      return response.data['url'];
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
  }
}
```

### Local Storage avec Hive
```dart
class StorageService {
  static const String _userBox = 'user';
  static const String _cartBox = 'cart';
  static const String _favoritesBox = 'favorites';

  Future<void> init() async {
    await Hive.initFlutter();
    
    // Register adapters
    Hive.registerAdapter(UserAdapter());
    Hive.registerAdapter(CartItemAdapter());
    Hive.registerAdapter(ProductAdapter());
    
    // Open boxes
    await Hive.openBox<User>(_userBox);
    await Hive.openBox<CartItem>(_cartBox);
    await Hive.openBox<Product>(_favoritesBox);
  }

  // User storage
  Future<void> saveUser(User user) async {
    final box = Hive.box<User>(_userBox);
    await box.put('current_user', user);
  }

  User? getUser() {
    final box = Hive.box<User>(_userBox);
    return box.get('current_user');
  }

  Future<void> clearUser() async {
    final box = Hive.box<User>(_userBox);
    await box.clear();
  }

  // Cart storage
  Future<void> saveCartItems(List<CartItem> items) async {
    final box = Hive.box<CartItem>(_cartBox);
    await box.clear();
    for (int i = 0; i < items.length; i++) {
      await box.put(i, items[i]);
    }
  }

  List<CartItem> getCartItems() {
    final box = Hive.box<CartItem>(_cartBox);
    return box.values.toList();
  }

  // Favorites storage
  Future<void> saveFavorites(List<Product> products) async {
    final box = Hive.box<Product>(_favoritesBox);
    await box.clear();
    for (final product in products) {
      await box.put(product.id, product);
    }
  }

  List<Product> getFavorites() {
    final box = Hive.box<Product>(_favoritesBox);
    return box.values.toList();
  }
}
```

## 🧪 Tests Flutter

### Unit Tests
```dart
// test/cubit/home_cubit_test.dart
void main() {
  group('HomeCubit', () {
    late HomeCubit homeCubit;
    late MockProductRepository mockProductRepository;

    setUp(() {
      mockProductRepository = MockProductRepository();
      homeCubit = HomeCubit(mockProductRepository);
    });

    tearDown(() {
      homeCubit.close();
    });

    test('initial state is HomeInitial', () {
      expect(homeCubit.state, isA<HomeInitial>());
    });

    blocTest<HomeCubit, HomeState>(
      'emits [HomeLoading, HomeLoaded] when loadHomeData is called',
      build: () {
        when(() => mockProductRepository.getHomeData())
            .thenAnswer((_) async => mockHomeData);
        return homeCubit;
      },
      act: (cubit) => cubit.loadHomeData(),
      expect: () => [
        isA<HomeLoading>(),
        isA<HomeLoaded>(),
      ],
    );
  });
}
```

### Widget Tests
```dart
// test/widgets/product_card_test.dart
void main() {
  group('ProductCard', () {
    testWidgets('displays product information correctly', (tester) async {
      final product = Product(
        id: '1',
        name: 'Test Product',
        price: 1000,
        category: 'Test',
        available: true,
        stockQuantity: 10,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: product),
          ),
        ),
      );

      expect(find.text('Test Product'), findsOneWidget);
      expect(find.text('1000 FCFA'), findsOneWidget);
    });

    testWidgets('calls onTap when tapped', (tester) async {
      bool tapped = false;
      final product = Product(
        id: '1',
        name: 'Test Product',
        price: 1000,
        category: 'Test',
        available: true,
        stockQuantity: 10,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: product,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ProductCard));
      expect(tapped, isTrue);
    });
  });
}
```

### Integration Tests
```dart
// integration_test/app_test.dart
void main() {
  group('FasoMarket App', () {
    testWidgets('complete purchase flow', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle();

      await tester.enterText(find.byKey(const Key('phone_field')), '+22670123456');
      await tester.enterText(find.byKey(const Key('password_field')), 'password');
      await tester.tap(find.byKey(const Key('submit_login')));
      await tester.pumpAndSettle();

      // Navigate to product
      await tester.tap(find.byType(ProductCard).first);
      await tester.pumpAndSettle();

      // Add to cart
      await tester.tap(find.byKey(const Key('add_to_cart')));
      await tester.pumpAndSettle();

      // Go to cart
      await tester.tap(find.byIcon(Icons.shopping_cart));
      await tester.pumpAndSettle();

      // Checkout
      await tester.tap(find.byKey(const Key('checkout_button')));
      await tester.pumpAndSettle();

      // Select payment method
      await tester.tap(find.byKey(const Key('orange_money')));
      await tester.enterText(find.byKey(const Key('phone_payment')), '+22670123456');
      
      // Complete payment
      await tester.tap(find.byKey(const Key('pay_button')));
      await tester.pumpAndSettle();

      // Verify success
      expect(find.text('Paiement réussi !'), findsOneWidget);
    });
  });
}
```

## 📦 Build & Deployment Flutter

### Build Configuration
```yaml
# pubspec.yaml
name: fasomarket
description: FasoMarket - Shopping Burkina Faso
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.16.0"

dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_bloc: ^8.1.3
  hydrated_bloc: ^9.1.2
  
  # Navigation
  go_router: ^12.1.1
  
  # Network
  dio: ^5.3.2
  retrofit: ^4.0.3
  json_annotation: ^4.8.1
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  flutter_secure_storage: ^9.0.0
  
  # UI
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Maps & Location
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  
  # Camera & Images
  image_picker: ^1.0.4
  
  # Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.9
  flutter_local_notifications: ^16.3.0
  
  # Utils
  intl: ^0.18.1
  share_plus: ^7.2.1
  url_launcher: ^6.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: flutter
  
  # Code Generation
  build_runner: ^2.4.7
  retrofit_generator: ^8.0.4
  json_serializable: ^6.7.1
  hive_generator: ^2.0.1
  
  # Testing
  bloc_test: ^9.1.4
  mocktail: ^1.0.1
  
  # Linting
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
  
  fonts:
    - family: Poppins
      fonts:
        - asset: assets/fonts/Poppins-Regular.ttf
        - asset: assets/fonts/Poppins-Medium.ttf
          weight: 500
        - asset: assets/fonts/Poppins-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Poppins-Bold.ttf
          weight: 700
```

### Flavors Configuration
```dart
// lib/config/app_config.dart
enum Environment { development, staging, production }

class AppConfig {
  static Environment _environment = Environment.development;
  
  static void setEnvironment(Environment env) {
    _environment = env;
  }
  
  static String get apiBaseUrl {
    switch (_environment) {
      case Environment.development:
        return 'http://192.168.1.100:8081';
      case Environment.staging:
        return 'https://staging-api.fasomarket.bf';
      case Environment.production:
        return 'https://api.fasomarket.bf';
    }
  }
  
  static bool get isDebug => _environment == Environment.development;
  static String get appName => 'FasoMarket${_environment == Environment.development ? ' Dev' : ''}';
}
```

### Android Build Configuration
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "bf.fasomarket.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
    }
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    
    flavorDimensions "environment"
    productFlavors {
        development {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
        }
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
        }
        production {
            dimension "environment"
        }
    }
}
```

Cette spécification complète couvre tous les aspects de l'application mobile Flutter FasoMarket, en parfaite harmonie avec la version web et utilisant le même backend Spring Boot. L'architecture Flutter proposée est robuste, scalable et suit les meilleures pratiques du développement mobile moderne.