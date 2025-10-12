import 'package:flutter/material.dart';
import '../services/consent_service.dart';

class VerificationRequestPreviewScreen extends StatefulWidget {
  final String? requester;
  final String? credentialType;
  final List<String>? requestedFields;
  final String? requestId;
  final String? ownerAddress;
  final Map<String, dynamic>? credentialDetails;

  const VerificationRequestPreviewScreen({
    super.key,
    this.requester,
    this.credentialType,
    this.requestedFields,
    this.requestId,
    this.ownerAddress,
    this.credentialDetails,
  });

  @override
  State<VerificationRequestPreviewScreen> createState() =>
      _VerificationRequestPreviewScreenState();
}

class _VerificationRequestPreviewScreenState
    extends State<VerificationRequestPreviewScreen> {
  bool _isLoading = false;
  String? _resultMessage;

  Future<void> _handleDecision(String decision) async {
    setState(() {
      _isLoading = true;
      _resultMessage = null;
    });
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _resultMessage =
          'Decision sent: ${decision == 'approved' ? 'Approved' : 'Rejected'}';
    });
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    Navigator.pop(context, decision == 'approved');
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
            'Request Preview',
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
            child: Container(
              padding: const EdgeInsets.all(32),
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
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Verification Request',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (widget.requester != null)
                    Text(
                      'Requester: ${widget.requester}',
                      style: const TextStyle(color: Colors.white70),
                    ),
                  if (widget.credentialType != null)
                    Text(
                      'Credential Type: ${widget.credentialType}',
                      style: const TextStyle(color: Colors.white70),
                    ),
                  if (widget.requestedFields != null &&
                      widget.requestedFields!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    const Text(
                      'Requested Fields:',
                      style: TextStyle(color: Colors.white70),
                    ),
                    ...widget.requestedFields!.map(
                      (f) => Text(
                        '- $f',
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                  if (widget.credentialDetails != null) ...[
                    const SizedBox(height: 16),
                    const Text(
                      'Credential Details:',
                      style: TextStyle(
                        color: Colors.white70,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    ...widget.credentialDetails!.entries.map(
                      (e) => Text(
                        '${e.key}: ${e.value}',
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                  const SizedBox(height: 32),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed:
                              _isLoading
                                  ? null
                                  : () => _handleDecision('approved'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.purpleAccent,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child:
                              _isLoading
                                  ? const SizedBox(
                                    height: 18,
                                    width: 18,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                  : const Text(
                                    'Approve',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                    ),
                                  ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: OutlinedButton(
                          onPressed:
                              _isLoading
                                  ? null
                                  : () => _handleDecision('denied'),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: Colors.pinkAccent,
                              width: 2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            'Reject',
                            style: TextStyle(
                              color: Colors.pinkAccent,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (_resultMessage != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      _resultMessage!,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
      backgroundColor: Colors.black,
    );
  }
}
