import 'package:flutter/material.dart';
import 'dart:math';
import 'dart:convert';
import '../services/api_service.dart';
// import '../theme/app_theme.dart'; // Removed unused import

class ActivityLogScreen extends StatefulWidget {
  const ActivityLogScreen({super.key});

  @override
  State<ActivityLogScreen> createState() => _ActivityLogScreenState();
}

class _ActivityLogScreenState extends State<ActivityLogScreen>
    with SingleTickerProviderStateMixin {
  List<String> _log = [];
  bool _isLoading = true;
  // String? _error; // Removed unused field
  late AnimationController _bgController;

  @override
  void initState() {
    super.initState();
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat();
    _loadLog();
  }

  @override
  void dispose() {
    _bgController.dispose();
    super.dispose();
  }

  Future<void> _loadLog() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final response = await ApiService.get('/api/activity-log');
      if (response.statusCode == 200) {
        // Parse response (assume JSON array of log strings)
        // Actual parsing:
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _log = data.cast<String>();
        });
      } else {
        setState(() {
          // Handle backend error if needed
        });
      }
    } catch (e) {
      setState(() {
        // Handle network error if needed
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _clearLog() async {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            backgroundColor: Colors.deepPurple[900]?.withValues(alpha: 0.85),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(
                color: Colors.purpleAccent.withValues(alpha: 0.3),
              ),
            ),
            title: const Text(
              'Clear Activity Log?',
              style: TextStyle(color: Colors.white),
            ),
            content: Text(
              'This will permanently delete all activity history.',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.7)),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Cancel',
                  style: TextStyle(color: Colors.white54),
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.purple, Colors.pink],
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: TextButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    // Placeholder for backend clear log endpoint
                    // await ApiService.post('/api/activity-log/clear');
                    await _loadLog();
                  },
                  child: const Text(
                    'Clear',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
    );
  }

  IconData _getIconForLog(String log) {
    if (log.contains('Verification success')) {
      return Icons.verified;
    }
    if (log.contains('Verification failed')) {
      return Icons.error;
    }
    if (log.contains('rejected')) {
      return Icons.block;
    }
    if (log.contains('Credential added')) {
      return Icons.add_circle;
    }
    return Icons.info;
  }

  List<Color> _getGradientForLog(String log) {
    if (log.contains('Verification success')) {
      return [Colors.purpleAccent, Colors.deepPurpleAccent];
    }
    if (log.contains('Verification failed')) {
      return [Colors.redAccent, Colors.purple];
    }
    if (log.contains('rejected')) {
      return [Colors.orange, Colors.purple];
    }
    if (log.contains('Credential added')) {
      return [Colors.purple, Colors.pinkAccent];
    }
    return [Colors.deepPurple, Colors.purpleAccent];
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
            'Activity Log',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        actions: [
          if (_log.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.white),
              onPressed: _clearLog,
            ),
        ],
      ),
      body: Stack(
        children: [
          AnimatedBuilder(
            animation: _bgController,
            builder: (context, child) {
              return CustomPaint(
                painter: _Web3BackgroundPainter(_bgController.value),
                child: Container(),
              );
            },
          ),
          SafeArea(
            child:
                _isLoading
                    ? const Center(
                      child: CircularProgressIndicator(
                        color: Colors.purpleAccent,
                      ),
                    )
                    : _log.isEmpty
                    ? _buildEmptyState()
                    : _buildLogList(),
          ),
        ],
      ),
      backgroundColor: Colors.black,
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.info_outline, color: Colors.purpleAccent, size: 48),
          SizedBox(height: 16),
          Text(
            'No activity yet.',
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildLogList() {
    return Column(
      children: [
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.deepPurple[900]?.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(16),
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
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.purpleAccent),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Total Activities: ',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: _log.length,
            itemBuilder: (context, idx) {
              final log = _log[idx];
              return _buildLogItem(log, idx);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildLogItem(String log, int index) {
    final gradient = _getGradientForLog(log);
    final icon = _getIconForLog(log);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient.map((c) => c.withValues(alpha: 0.13)).toList(),
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: gradient[0].withValues(alpha: 0.3), width: 2),
        boxShadow: [
          BoxShadow(
            color: gradient[0].withValues(alpha: 0.18),
            blurRadius: 18,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(18),
        leading: Container(
          padding: const EdgeInsets.all(12),
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
          child: Icon(icon, color: Colors.white, size: 28),
        ),
        title: Text(
          log,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Row(
            children: [
              Icon(
                Icons.access_time,
                size: 14,
                color: Colors.white.withValues(alpha: 0.5),
              ),
              const SizedBox(width: 4),
              Text(
                'Activity #${_log.length - index}',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: gradient[0].withValues(alpha: 0.22),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(Icons.chevron_right, color: gradient[0], size: 20),
        ),
      ),
    );
  }
}

class _Web3BackgroundPainter extends CustomPainter {
  final double animationValue;
  _Web3BackgroundPainter(this.animationValue);

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

    final nodes = List.generate(7, (i) {
      final angle = animationValue * 2 * pi + i * pi / 3.5;
      final radius = size.width * 0.32 + 18 * sin(animationValue * 2 * pi + i);
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
      canvas.drawCircle(node, 10, nodePaint);
      canvas.drawCircle(
        node,
        3,
        nodePaint..color = Colors.purpleAccent.withValues(alpha: 0.5),
      );
    }
    // Add animated floating particles
    final particlePaint =
        Paint()
          ..color = Colors.purpleAccent.withValues(alpha: 0.09)
          ..style = PaintingStyle.fill;
    for (int i = 0; i < 18; i++) {
      final angle = animationValue * 2 * pi + i * pi / 9;
      final radius = size.width * 0.45 + 30 * sin(animationValue * 2 * pi + i);
      final offset = Offset(
        size.width / 2 + radius * cos(angle),
        size.height / 2 + radius * sin(angle),
      );
      canvas.drawCircle(offset, 6, particlePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
