import 'package:flutter/material.dart';
import '../screens/qr_scanner_screen.dart';
import '../services/verification_service.dart';
import '../services/activity_log_service.dart';
import '../theme/app_theme.dart';
import 'verification_request_preview_screen.dart';

const String HARDCODED_ACCESS_CODE = "EDU-2025-VERISHARE";
const Map<String, dynamic> educationCredential = {
  'type': 'Education',
  'title': 'BSc Computer Science',
  'issuer': 'University of Lagos',
  'year': '2022',
  'name': 'Adebayo John',
  'matricNo': 'UOL/CSC/2018/1234',
  'department': 'Computer Science',
  'faculty': 'Science',
  'stateOfOrigin': 'Lagos',
  'dob': '1999-04-12',
  'cgpa': '4.52',
};

class VerificationScreen extends StatefulWidget {
  const VerificationScreen({super.key});

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen>
    with TickerProviderStateMixin {
  final TextEditingController _tokenController = TextEditingController();
  String? _verificationResult;
  bool _isLoading = false;
  bool _isSuccess = false;
  late AnimationController _resultController;

  @override
  void initState() {
    super.initState();
    _resultController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
  }

  @override
  void dispose() {
    _tokenController.dispose();
    _resultController.dispose();
    super.dispose();
  }

  void _onScanQr() async {
    final scannedToken = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const QrScannerScreen()),
    );
    if (scannedToken != null && scannedToken is String) {
      _tokenController.text = scannedToken;
    }
  }

  void _onVerify() async {
    final token = _tokenController.text.trim();
    if (token.isEmpty) return;

    Map<String, dynamic>? details;
    if (token == HARDCODED_ACCESS_CODE) {
      details = educationCredential;
    }

    final approved = await Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => VerificationRequestPreviewScreen(
              requester: 'Org XYZ',
              credentialType: 'Education',
              requestedFields: details?.keys.toList(),
              credentialDetails: details,
              requestId: 'MOCK-REQ-001',
              ownerAddress: '0xDEMOOWNER123',
            ),
      ),
    );
    if (approved != true) {
      setState(() {
        _verificationResult = 'Verification request rejected.';
        _isSuccess = false;
      });
      _resultController.forward(from: 0);
      await ActivityLogService.addLog(
        'Verification rejected at ${DateTime.now().toIso8601String()}',
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _verificationResult = null;
    });
    try {
      final result = await VerificationService.verifyToken(token);
      if (result != null) {
        await ActivityLogService.addLog(
          'Verification success at ${DateTime.now().toIso8601String()}',
        );
      } else {
        await ActivityLogService.addLog(
          'Verification failed at ${DateTime.now().toIso8601String()}',
        );
      }
      setState(() {
        _isLoading = false;
        if (result != null) {
          _verificationResult = 'Verification successful!';
          _isSuccess = true;
        } else {
          _verificationResult =
              'Verification failed. Invalid or expired token.';
          _isSuccess = false;
        }
      });
      _resultController.forward(from: 0);
    } catch (e) {
      await ActivityLogService.addLog(
        'Verification error at ${DateTime.now().toIso8601String()}',
      );
      setState(() {
        _isLoading = false;
        _verificationResult = 'An error occurred. Please try again.';
        _isSuccess = false;
      });
      _resultController.forward(from: 0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Verification',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.backgroundDark,
              AppTheme.backgroundDark.withBlue(30),
            ],
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(24.0),
            children: [
              const SizedBox(height: 20),
              _buildHeaderCard(),
              const SizedBox(height: 32),
              _buildScanButton(),
              const SizedBox(height: 16),
              const Row(
                children: [
                  Expanded(child: Divider(color: Colors.white24)),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'OR',
                      style: TextStyle(
                        color: Colors.white54,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Expanded(child: Divider(color: Colors.white24)),
                ],
              ),
              const SizedBox(height: 16),
              _buildTokenInput(),
              const SizedBox(height: 24),
              _buildVerifyButton(),
              if (_verificationResult != null) ...[
                const SizedBox(height: 32),
                _buildResultCard(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.glassBackground(
        gradientColors: [AppTheme.accentCyan, AppTheme.accentBlue],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.accentCyan.withValues(alpha: 0.4),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: const Icon(
              Icons.verified_user,
              size: 48,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Verify Credentials',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Scan QR code or enter access token to verify credentials',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.7),
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildScanButton() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.accentPurple, AppTheme.accentPink],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppTheme.accentPurple.withValues(alpha: 0.4),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: _onScanQr,
        icon: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 28),
        label: const Text(
          'Scan QR Code',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildTokenInput() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.accentCyan.withValues(alpha: 0.3),
            AppTheme.accentBlue.withValues(alpha: 0.3),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.backgroundLight,
          borderRadius: BorderRadius.circular(12),
        ),
        child: TextField(
          controller: _tokenController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Access Token',
            labelStyle: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: Colors.transparent,
            prefixIcon: const Icon(Icons.key, color: AppTheme.accentCyan),
          ),
          maxLines: 3,
        ),
      ),
    );
  }

  Widget _buildVerifyButton() {
    return Container(
      decoration: BoxDecoration(
        gradient: AppTheme.successGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppTheme.accentGreen.withValues(alpha: 0.4),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _isLoading ? null : _onVerify,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child:
            _isLoading
                ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
                : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.shield_outlined, color: Colors.white),
                    SizedBox(width: 12),
                    Text(
                      'Verify',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
      ),
    );
  }

  Widget _buildResultCard() {
    return AnimatedBuilder(
      animation: _resultController,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.9 + (_resultController.value * 0.1),
          child: Opacity(
            opacity: _resultController.value,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: AppTheme.glassBackground(
                gradientColors:
                    _isSuccess
                        ? [AppTheme.accentGreen, AppTheme.accentCyan]
                        : [Colors.red, Colors.orange],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors:
                            _isSuccess
                                ? [AppTheme.accentGreen, AppTheme.accentCyan]
                                : [Colors.red, Colors.orange],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _isSuccess ? Icons.check_circle : Icons.error,
                      size: 48,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _verificationResult!,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (_isSuccess) ...[
                    const SizedBox(height: 16),
                    Text(
                      'Blockchain verified',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
