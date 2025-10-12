class VerificationService {
  static Future<Map<String, dynamic>?> verifyToken(String token) async {
    // Demo: Always return a mock success for the hardcoded code
    await Future.delayed(const Duration(milliseconds: 500));
    if (token == 'EDU-2025-VERISHARE') {
      return {'status': 'success'};
    } else {
      return null;
    }
  }
}
