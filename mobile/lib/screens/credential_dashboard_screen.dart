import 'package:flutter/material.dart';
import 'dart:math';
import 'package:flutter/rendering.dart';
import 'dart:convert';
// import '../theme/app_theme.dart'; // Removed unused import
import '../services/api_service.dart';

class CredentialDashboardScreen extends StatefulWidget {
  const CredentialDashboardScreen({super.key});

  @override
  State<CredentialDashboardScreen> createState() =>
      _CredentialDashboardScreenState();
}

class _CredentialDashboardScreenState extends State<CredentialDashboardScreen>
    with TickerProviderStateMixin {
  void _showCredentialDetails(Map<String, dynamic> cred) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          backgroundColor:
              Colors.deepPurple[900]?.withOpacity(0.95) ?? Colors.black,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      cred['icon'] as IconData? ?? Icons.folder,
                      color: Colors.white,
                      size: 36,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        cred['title'] ?? '',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ...cred.entries
                    .where(
                      (e) =>
                          ![
                            'icon',
                            'gradient',
                            'type',
                            'title',
                          ].contains(e.key),
                    )
                    .map(
                      (e) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${_formatKey(e.key)}: ',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.cyanAccent,
                              ),
                            ),
                            Expanded(
                              child: Text(
                                '${e.value}',
                                style: const TextStyle(color: Colors.white70),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                const SizedBox(height: 18),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text(
                      'Close',
                      style: TextStyle(color: Colors.cyanAccent),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatKey(String key) {
    // Convert camelCase or snake_case to Title Case
    return key
        .replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m[0]}')
        .replaceAll('_', ' ')
        .replaceFirstMapped(RegExp(r'^[a-z]'), (m) => m[0]!.toUpperCase());
  }

  late TabController _tabController;
  late AnimationController _bgController;
  List<Map<String, dynamic>> _credentials = [
    // Education
    {
      'type': 'Education',
      'title': 'BSc Computer Science',
      'issuer': 'University of Lagos',
      'year': '2022',
      'icon': Icons.school,
      'gradient': [Colors.blueAccent, Colors.lightBlueAccent],
      'name': 'Adebayo John',
      'matricNo': 'UOL/CSC/2018/1234',
      'department': 'Computer Science',
      'faculty': 'Science',
      'stateOfOrigin': 'Lagos',
      'dob': '1999-04-12',
      'cgpa': '4.52',
    },
    {
      'type': 'Education',
      'title': 'MSc Data Science',
      'issuer': 'Covenant University',
      'year': '2024',
      'icon': Icons.school,
      'gradient': [Colors.indigo, Colors.blueAccent],
      'name': 'Adebayo John',
      'matricNo': 'CU/DS/2022/5678',
      'department': 'Data Science',
      'faculty': 'Engineering',
      'stateOfOrigin': 'Lagos',
      'dob': '1999-04-12',
      'cgpa': '4.88',
    },
    // Government
    {
      'type': 'Government',
      'title': 'National ID',
      'issuer': 'NIMC',
      'year': '2021',
      'icon': Icons.badge,
      'gradient': [Colors.green, Colors.teal],
      'name': 'Adebayo John',
      'nin': '1234-5678-9012',
      'stateOfOrigin': 'Lagos',
      'dob': '1999-04-12',
      'gender': 'Male',
      'address': '12, Allen Avenue, Ikeja, Lagos',
      'phone': '+2348012345678',
    },
    {
      'type': 'Government',
      'title': 'Voter Card',
      'issuer': 'INEC',
      'year': '2019',
      'icon': Icons.how_to_vote,
      'gradient': [Colors.teal, Colors.greenAccent],
      'name': 'Adebayo John',
      'vin': 'INEC-2023-0001',
      'stateOfOrigin': 'Lagos',
      'dob': '1999-04-12',
      'gender': 'Male',
      'ward': 'Ward 5',
      'lga': 'Ikeja',
    },
    // Private
    {
      'type': 'Private',
      'title': 'Employee ID',
      'issuer': 'Andela',
      'year': '2025',
      'icon': Icons.work,
      'gradient': [Colors.purple, Colors.deepPurpleAccent],
      'name': 'Adebayo John',
      'employeeId': 'AND-EMP-2025-001',
      'department': 'Engineering',
      'role': 'Software Engineer',
      'stateOfOrigin': 'Lagos',
      'dob': '1999-04-12',
      'email': 'adebayo.john@andela.com',
    },
    {
      'type': 'Private',
      'title': 'Health Insurance',
      'issuer': 'AXA Mansard',
      'year': '2023',
      'icon': Icons.health_and_safety,
      'gradient': [Colors.pinkAccent, Colors.redAccent],
      'name': 'Adebayo John',
      'policyNo': 'AXA-2023-INS-0099',
      'stateOfOrigin': 'Lagos',
      'dob': '1999-04-12',
      'plan': 'Premium',
      'validTill': '2026-12-31',
    },
  ];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    )..repeat();
    _fetchCredentials();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _bgController.dispose();
    super.dispose();
  }

  Future<void> _fetchCredentials() async {
    // For MVP/hackathon, skip API and use mock data
    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: ShaderMask(
          shaderCallback: (Rect bounds) {
            return LinearGradient(
              colors: [Colors.purpleAccent, Colors.pinkAccent],
            ).createShader(bounds);
          },
          child: const Text(
            'Credentials',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
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
                painter: _Web3DashboardBackgroundPainter(_bgController.value),
                child: Container(),
              );
            },
          ),
          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 16),
                // Add Credential button at the top
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.purpleAccent, Colors.pinkAccent],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.purpleAccent.withOpacity(0.3),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: FloatingActionButton.extended(
                    onPressed: () {},
                    backgroundColor: Colors.transparent,
                    elevation: 0,
                    icon: const Icon(Icons.add, color: Colors.white),
                    label: const Text(
                      'Add Credential',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                // Removed stats cards for MVP
                const SizedBox(height: 24),
                _buildCategoryTabs(),
                const SizedBox(height: 16),
                Expanded(
                  child:
                      _isLoading
                          ? const Center(
                            child: CircularProgressIndicator(
                              color: Colors.purpleAccent,
                            ),
                          )
                          : _error != null
                          ? Center(
                            child: Text(
                              _error!,
                              style: const TextStyle(color: Colors.redAccent),
                            ),
                          )
                          : _buildCredentialsList(),
                ),
              ],
            ),
          ),
        ],
      ),
      backgroundColor: Colors.black,
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required List<Color> gradient,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient.map((c) => c.withValues(alpha: 0.18)).toList(),
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: gradient[0].withValues(alpha: 0.18),
            blurRadius: 18,
            spreadRadius: 2,
          ),
        ],
        border: Border.all(color: gradient[0].withValues(alpha: 0.3), width: 2),
      ),
      child: Column(
        children: [
          Icon(icon, color: gradient[0], size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryTabs() {
    return Container(
      height: 54,
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.deepPurple[900]?.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.purpleAccent.withValues(alpha: 0.18)),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.purpleAccent, Colors.pinkAccent],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white.withValues(alpha: 0.5),
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
        tabs: const [
          Tab(text: 'All'),
          Tab(text: 'Education'),
          Tab(text: 'Government'),
          Tab(text: 'Private'),
        ],
      ),
    );
  }

  Widget _buildCredentialsList() {
    // Filter by tab
    List<Map<String, dynamic>> filtered = _credentials;
    if (_tabController.index == 1) {
      filtered = _credentials.where((c) => c['type'] == 'Education').toList();
    } else if (_tabController.index == 2) {
      filtered = _credentials.where((c) => c['type'] == 'Government').toList();
    } else if (_tabController.index == 3) {
      filtered = _credentials.where((c) => c['type'] == 'Private').toList();
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: filtered.length,
      itemBuilder: (context, index) {
        final cred = filtered[index];
        return _buildCredentialCard(cred);
      },
    );
  }

  Widget _buildCredentialCard(Map<String, dynamic> cred) {
    final gradient =
        cred['gradient'] as List<Color>? ??
        [Colors.purpleAccent, Colors.deepPurpleAccent];
    final icon = cred['icon'] as IconData? ?? Icons.folder;
    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient.map((c) => c.withValues(alpha: 0.13)).toList(),
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: gradient[0].withValues(alpha: 0.3), width: 2),
        boxShadow: [
          BoxShadow(
            color: gradient[0].withValues(alpha: 0.18),
            blurRadius: 18,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: () => _showCredentialDetails(cred),
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: gradient),
                    borderRadius: BorderRadius.circular(18),
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
                const SizedBox(width: 18),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cred['type'] as String? ?? 'Credential',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Issuer: ${cred['issuer'] ?? 'Unknown'}',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withValues(alpha: 0.7),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Year: ${cred['year'] ?? ''}',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: gradient[0], size: 26),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Move the painter class to the top-level (outside of any other class)

class _Web3DashboardBackgroundPainter extends CustomPainter {
  final double animationValue;
  _Web3DashboardBackgroundPainter(this.animationValue);

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

    final nodes = List.generate(8, (i) {
      final angle = animationValue * 2 * pi + i * pi / 4;
      final radius = size.width * 0.36 + 22 * sin(animationValue * 2 * pi + i);
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
      canvas.drawCircle(node, 12, nodePaint);
      canvas.drawCircle(
        node,
        4,
        nodePaint..color = Colors.purpleAccent.withValues(alpha: 0.5),
      );
    }
    // Add animated floating particles
    final particlePaint =
        Paint()
          ..color = Colors.purpleAccent.withValues(alpha: 0.09)
          ..style = PaintingStyle.fill;
    for (int i = 0; i < 22; i++) {
      final angle = animationValue * 2 * pi + i * pi / 11;
      final radius = size.width * 0.52 + 36 * sin(animationValue * 2 * pi + i);
      final offset = Offset(
        size.width / 2 + radius * cos(angle),
        size.height / 2 + radius * sin(angle),
      );
      canvas.drawCircle(offset, 7, particlePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _Web3DashboardBackgroundPainter oldDelegate) =>
      true;
}
