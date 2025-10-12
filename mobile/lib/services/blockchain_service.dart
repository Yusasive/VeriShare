import 'dart:convert';
import 'package:crypto/crypto.dart';
// import '../config/app_config.dart';
import 'api_service.dart';

class BlockchainService {
  static Future<Map<String, dynamic>?> uploadCredential({
    required String subject,
    required String encryptedCredential,
    String? uri,
  }) async {
    // Hash the encrypted credential to hex
    final hash = sha256.convert(utf8.encode(encryptedCredential)).toString();
    final hashHex = '0x$hash';
    final endpoint = '/api/evm/credential/issue';
    final response = await ApiService.post(
      endpoint,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'subject': subject,
        'hashHex': hashHex,
        'uri': uri ?? '',
      }),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    } else {
      return null;
    }
  }
}
