import 'package:flutter/material.dart';
import 'dart:math';
// import '../theme/app_theme.dart';
import '../services/api_service.dart';
import 'add_edit_credential_screen.dart';
import 'credential_dashboard_screen.dart';
import 'qr_scanner_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _bgController;
  late AnimationController _pulseController;
  Map<String, dynamic>? _dashboardData;

  String? _error;

  @override
  void initState() {
    super.initState();
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    try {
      final data = await ApiService.getDashboardData();
      setState(() {
        _dashboardData = data;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_dashboardData == null && _error == null) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(color: Colors.purpleAccent),
        ),
      );
    }
    if (_error != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Text(_error!, style: const TextStyle(color: Colors.redAccent)),
        ),
      );
    }
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: ShaderMask(
          shaderCallback: (Rect bounds) {
            return LinearGradient(
              colors: [Colors.purpleAccent, Colors.pinkAccent],
            ).createShader(bounds);
          },
          child: const Text(
            'VeriShare',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Stack(
        children: [
          AnimatedBuilder(
            animation: _bgController,
            builder: (context, child) {
              return CustomPaint(
                painter: _Web3HomeBackgroundPainter(_bgController.value),
                child: Container(),
              );
            },
          ),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                const SizedBox(height: 20),
                if (_dashboardData != null) ...[
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.deepPurple[900]?.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.purpleAccent.withValues(alpha: 0.2),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                      border: Border.all(
                        color: Colors.purpleAccent.withValues(alpha: 0.3),
                        width: 1.5,
                      ),
                    ),
                    child: Text(
                      'Dashboard Summary: \n${_dashboardData.toString()}',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: 1.0 + (_pulseController.value * 0.05),
                      child: Container(
                        padding: const EdgeInsets.all(36),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.purpleAccent.withValues(alpha: 0.3),
                              Colors.pinkAccent.withValues(alpha: 0.18),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(
                            color: Colors.purpleAccent.withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.purpleAccent.withValues(alpha: 0.2),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.account_balance_wallet,
                              color: Colors.purpleAccent,
                              size: 64,
                            ),
                            const SizedBox(height: 18),
                            const Text(
                              'Welcome to VeriShare',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Decentralized Credential Management',
                              style: TextStyle(
                                fontSize: 15,
                                color: Colors.white.withValues(alpha: 0.7),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 32),
                _buildSectionTitle('Quick Actions'),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildQuickActionCard(
                        icon: Icons.qr_code_scanner_rounded,
                        title: 'Scan QR',
                        gradient: [Colors.purpleAccent, Colors.pinkAccent],
                        onTap: () => _navigate(const QrScannerScreen()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildQuickActionCard(
                        icon: Icons.add_card_rounded,
                        title: 'Add Credential',
                        gradient: [
                          Colors.deepPurpleAccent,
                          Colors.purpleAccent,
                        ],
                        onTap: () => _navigate(const AddEditCredentialScreen()),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildSectionTitle('Credentials'),
                const SizedBox(height: 16),
                _buildWeb3Card(
                  icon: Icons.dashboard_customize_rounded,
                  title: 'View All Credentials',
                  subtitle: 'Manage your digital credentials',
                  gradient: [Colors.purpleAccent, Colors.pinkAccent],
                  onTap: () => _navigate(const CredentialDashboardScreen()),
                ),
                const SizedBox(height: 24),
                _buildSectionTitle('Recent Activity'),
                const SizedBox(height: 16),
                _buildActivityCard(
                  icon: Icons.verified_user_rounded,
                  title: 'Credential Verified',
                  subtitle: 'Educational Certificate - 2 hours ago',
                  gradient: [Colors.purpleAccent, Colors.pinkAccent],
                ),
                const SizedBox(height: 12),
                _buildActivityCard(
                  icon: Icons.add_circle_rounded,
                  title: 'Credential Added',
                  subtitle: 'Professional License - Yesterday',
                  gradient: [Colors.deepPurpleAccent, Colors.purpleAccent],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
      backgroundColor: Colors.black,
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 19,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required List<Color> gradient,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradient.map((c) => c.withValues(alpha: 0.13)).toList(),
          ),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: gradient[0].withValues(alpha: 0.3),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: gradient[0].withValues(alpha: 0.18),
              blurRadius: 18,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: gradient),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: gradient[0].withValues(alpha: 0.25),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Icon(icon, color: Colors.white, size: 34),
            ),
            const SizedBox(height: 14),
            Text(
              title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeb3Card({
    required IconData icon,
    required String title,
    required String subtitle,
    required List<Color> gradient,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradient.map((c) => c.withValues(alpha: 0.13)).toList(),
          ),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: gradient[0].withValues(alpha: 0.3),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: gradient[0].withValues(alpha: 0.18),
              blurRadius: 18,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: gradient),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: gradient[0].withValues(alpha: 0.25),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Icon(icon, color: Colors.white, size: 30),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: gradient[0], size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required List<Color> gradient,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient.map((c) => c.withValues(alpha: 0.13)).toList(),
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: gradient[0].withValues(alpha: 0.3), width: 2),
        boxShadow: [
          BoxShadow(
            color: gradient[0].withValues(alpha: 0.18),
            blurRadius: 18,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: gradient),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: gradient[0].withValues(alpha: 0.25),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _navigate(Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (context) => screen));
  }
}

class _Web3HomeBackgroundPainter extends CustomPainter {
  final double animationValue;
  _Web3HomeBackgroundPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final bg =
        Paint()
          ..shader = LinearGradient(
            colors: [
              Colors.black,
              Colors.deepPurple[900]!,
              Colors.purple[900]!,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bg);

    final nodePaint =
        Paint()
          ..color = Colors.purpleAccent.withValues(alpha: 0.18)
          ..style = PaintingStyle.fill;
    final edgePaint =
        Paint()
          ..color = Colors.purpleAccent.withValues(alpha: 0.13)
          ..strokeWidth = 2;

    final nodes = List.generate(9, (i) {
      final angle = animationValue * 2 * pi + i * pi / 4.5;
      final radius = size.width * 0.38 + 24 * sin(animationValue * 2 * pi + i);
      return Offset(
        size.width / 2 + radius * cos(angle),
        size.height / 2 + radius * sin(angle),
      );
    });
    for (int i = 0; i < nodes.length; i++) {
      for (int j = i + 1; j < nodes.length; j++) {
        canvas.drawLine(nodes[i], nodes[j], edgePaint);
      }
    }
    for (final node in nodes) {
      canvas.drawCircle(node, 13, nodePaint);
      canvas.drawCircle(
        node,
        5,
        nodePaint..color = Colors.purpleAccent.withValues(alpha: 0.5),
      );
    }
    // Add animated floating particles
    final particlePaint =
        Paint()
          ..color = Colors.purpleAccent.withValues(alpha: 0.09)
          ..style = PaintingStyle.fill;
    for (int i = 0; i < 26; i++) {
      final angle = animationValue * 2 * pi + i * pi / 13;
      final radius = size.width * 0.56 + 40 * sin(animationValue * 2 * pi + i);
      final offset = Offset(
        size.width / 2 + radius * cos(angle),
        size.height / 2 + radius * sin(angle),
      );
      canvas.drawCircle(offset, 8, particlePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
