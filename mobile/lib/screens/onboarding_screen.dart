import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'dart:math';
import 'wallet_connect_screen.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback? onFinished;
  const OnboardingScreen({super.key, this.onFinished});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  final List<Map<String, dynamic>> _pages = [
    {
      'icon': Icons.security_outlined,
      'title': 'Secure by Design',
      'description':
          'Your credentials are encrypted and stored securely using blockchain technology',
      'gradient': [AppTheme.accentCyan, AppTheme.accentBlue],
    },
    {
      'icon': Icons.verified_user_outlined,
      'title': 'Verified Identity',
      'description':
          'Prove your identity instantly without sharing sensitive information',
      'gradient': [AppTheme.accentBlue, AppTheme.accentPurple],
    },
    // Add more pages as needed
  ];
  // ...existing code...
  late AnimationController _bgController;
  late AnimationController _pulseController;

  // Only one initState and dispose allowed, keep the first definition above.

  Widget _buildPageIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        _pages.length,
        (index) => AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: _currentPage == index ? 32 : 8,
          decoration: BoxDecoration(
            gradient:
                _currentPage == index
                    ? LinearGradient(
                      colors: _pages[_currentPage]['gradient'] as List<Color>,
                    )
                    : null,
            color:
                _currentPage == index
                    ? null
                    : Colors.white.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ),
    );
  }

  Widget _buildNavigationButton() {
    final isLastPage = _currentPage == _pages.length - 1;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _pages[_currentPage]['gradient'] as List<Color>,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (_pages[_currentPage]['gradient'] as List<Color>)[0]
                .withValues(alpha: 0.4),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: () {
          if (isLastPage) {
            _completeOnboarding();
          } else {
            _pageController.nextPage(
              duration: const Duration(milliseconds: 400),
              curve: Curves.easeInOut,
            );
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              isLastPage ? 'Get Started' : 'Continue',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward, color: Colors.white, size: 20),
          ],
        ),
      ),
    );
  }

  // Fields are already defined above, remove duplicates here.

  @override
  void initState() {
    super.initState();
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _bgController.dispose();
    _pulseController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          AnimatedBuilder(
            animation: _bgController,
            builder: (context, child) {
              return CustomPaint(
                painter: _Web3OnboardingBackgroundPainter(_bgController.value),
                child: Container(),
              );
            },
          ),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors:
                                    _pages[_currentPage]['gradient']
                                        as List<Color>,
                              ),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: (_pages[_currentPage]['gradient']
                                          as List<Color>)[0]
                                      .withValues(alpha: 0.18),
                                  blurRadius: 12,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.shield,
                              color: Colors.white,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 12),
                          ShaderMask(
                            shaderCallback: (Rect bounds) {
                              return LinearGradient(
                                colors: [
                                  Colors.purpleAccent,
                                  Colors.pinkAccent,
                                ],
                              ).createShader(bounds);
                            },
                            child: const Text(
                              'VeriShare',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (_currentPage < _pages.length - 1)
                        TextButton(
                          onPressed: _completeOnboarding,
                          child: const Text(
                            'Skip',
                            style: TextStyle(
                              color: Colors.purpleAccent,
                              fontSize: 16,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    itemCount: _pages.length,
                    itemBuilder: (context, index) {
                      return _buildPage(_pages[index]);
                    },
                  ),
                ),
                _buildPageIndicator(),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: _buildNavigationButton(),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
      backgroundColor: Colors.black,
    );
  }

  void _completeOnboarding() {
    if (widget.onFinished != null) {
      widget.onFinished!();
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const WalletConnectScreen()),
      );
    }
  }

  Widget _buildPage(Map<String, dynamic> page) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              return Transform.scale(
                scale: 1.0 + (_pulseController.value * 0.05),
                child: Container(
                  padding: const EdgeInsets.all(44),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors:
                          (page['gradient'] as List<Color>)
                              .map((c) => c.withValues(alpha: 0.18))
                              .toList(),
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: (page['gradient'] as List<Color>)[0].withValues(
                          alpha: 0.22,
                        ),
                        blurRadius: 44,
                        spreadRadius: 12,
                      ),
                    ],
                  ),
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: page['gradient'] as List<Color>,
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: (page['gradient'] as List<Color>)[0]
                              .withValues(alpha: 0.25),
                          blurRadius: 18,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: Icon(
                      page['icon'] as IconData,
                      size: 84,
                      color: Colors.white,
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 60),
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return LinearGradient(
                colors: [Colors.purpleAccent, Colors.pinkAccent],
              ).createShader(bounds);
            },
            child: Text(
              page['title'] as String,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            page['description'] as String,
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withValues(alpha: 0.7),
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _Web3OnboardingBackgroundPainter extends CustomPainter {
  final double animationValue;
  _Web3OnboardingBackgroundPainter(this.animationValue);

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
        5,
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
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
