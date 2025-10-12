import 'package:flutter/material.dart';
// import '../theme/app_theme.dart'; // Removed unused import
import 'activity_log_screen.dart';
import 'credential_dashboard_screen.dart';
import 'home_screen.dart';
import 'settings_screen.dart';
import 'verification_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  final List<Widget> _tabs = const [
    HomeScreen(),
    CredentialDashboardScreen(),
    VerificationScreen(),
    ActivityLogScreen(),
    SettingsScreen(),
  ];

  final List<_NavigationItem> _items = const [
    _NavigationItem(label: 'Home', icon: Icons.home_rounded),
    _NavigationItem(label: 'Credentials', icon: Icons.badge_rounded),
    _NavigationItem(label: 'Verify', icon: Icons.verified_user_rounded),
    _NavigationItem(label: 'Audit', icon: Icons.receipt_long_rounded),
    _NavigationItem(label: 'Settings', icon: Icons.settings_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Animated gradient background
          Positioned.fill(
            child: AnimatedContainer(
              duration: const Duration(seconds: 2),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.black,
                    Colors.deepPurple.shade900,
                    Colors.purple.shade900,
                  ],
                ),
              ),
              // Move child to last argument
              child: Opacity(
                opacity: 0.18,
                child: Image.asset(
                  'assets/bg_web3.png',
                  fit: BoxFit.cover,
                  repeat: ImageRepeat.noRepeat,
                ),
              ),
            ),
          ),
          // Tab content with fade transition
          Positioned.fill(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 500),
              switchInCurve: Curves.easeInOut,
              switchOutCurve: Curves.easeInOut,
              child: _tabs[_currentIndex],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.only(bottom: 8, left: 8, right: 8),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.purpleAccent.withValues(alpha: 0.22),
              Colors.pinkAccent.withValues(alpha: 0.22),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: Colors.purpleAccent.withValues(alpha: 0.3),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.purpleAccent.withValues(alpha: 0.18),
              blurRadius: 24,
              spreadRadius: 8,
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              backgroundColor: Colors.transparent,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: Colors.purpleAccent,
              unselectedItemColor: Colors.white.withValues(alpha: 0.5),
              showUnselectedLabels: true,
              selectedFontSize: 13,
              unselectedFontSize: 11,
              elevation: 0,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
              items:
                  _items
                      .map(
                        (item) => BottomNavigationBarItem(
                          icon: Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Icon(
                              item.icon,
                              size: 26,
                              shadows: [
                                Shadow(
                                  color: Colors.purpleAccent.withValues(
                                    alpha: 0.3,
                                  ),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                          ),
                          activeIcon: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.purpleAccent.withValues(alpha: 0.32),
                                  Colors.pinkAccent.withValues(alpha: 0.32),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.purpleAccent.withValues(
                                    alpha: 0.22,
                                  ),
                                  blurRadius: 16,
                                  spreadRadius: 4,
                                ),
                              ],
                            ),
                            child: Icon(
                              item.icon,
                              size: 26,
                              color: Colors.white,
                            ),
                          ),
                          label: item.label,
                        ),
                      )
                      .toList(),
              onTap: (index) {
                setState(() => _currentIndex = index);
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _NavigationItem {
  final String label;
  final IconData icon;

  const _NavigationItem({required this.label, required this.icon});
}
