import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import '../services/consent_service.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? _controller;
  bool _scanned = false;
  String? _resultMessage;
  Map<String, dynamic>? _requestDetails;

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    _controller = controller;
    controller.scannedDataStream.listen((scanData) async {
      if (!_scanned) {
        setState(() {
          _scanned = true;
        });
        _controller?.pauseCamera();
        if (!mounted) return;
        final code = scanData.code ?? '';
        if (code.isEmpty) {
          setState(() {
            _resultMessage = 'Invalid QR code';
          });
          return;
        }
        final details = await ConsentService.fetchRequest(code);
        setState(() {
          _requestDetails = details;
          _resultMessage =
              details != null
                  ? 'Request found'
                  : 'Request not found or expired';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
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
            'Scan QR Code',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          // Animated background
          Positioned.fill(
            child: Container(
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
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.purpleAccent.withValues(alpha: 0.18),
                        Colors.pinkAccent.withValues(alpha: 0.18),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(24),
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
                  child: SizedBox(
                    height: 320,
                    width: 320,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: QRView(
                        key: qrKey,
                        onQRViewCreated: _onQRViewCreated,
                      ),
                    ),
                  ),
                ),
                if (_resultMessage != null) ...[
                  const SizedBox(height: 24),
                  Text(
                    _resultMessage!,
                    style: const TextStyle(color: Colors.white),
                  ),
                ],
                if (_requestDetails != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    'Request ID: ${_requestDetails!['requestId'] ?? ''}',
                    style: const TextStyle(color: Colors.white),
                  ),
                  Text(
                    'Organization: ${_requestDetails!['organizationAddress'] ?? ''}',
                    style: const TextStyle(color: Colors.white70),
                  ),
                  Text(
                    'Status: ${_requestDetails!['status'] ?? ''}',
                    style: const TextStyle(color: Colors.white70),
                  ),
                  Text(
                    'Expires: ${_requestDetails!['expiresAt'] ?? ''}',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
      backgroundColor: Colors.black,
    );
  }
}
