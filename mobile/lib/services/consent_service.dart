import 'dart:convert';
import 'package:http/http.dart' as http;

class ConsentService {
  static const String _baseUrl =
      'http://localhost:5000/consent'; // Update as needed

  static Future<Map<String, dynamic>?> fetchRequest(String requestId) async {
    final url = Uri.parse('$_baseUrl/id/$requestId');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return json.decode(response.body)['request'] as Map<String, dynamic>;
    } else {
      return null;
    }
  }

  static Future<Map<String, dynamic>?> sendDecision({
    required String requestId,
    required String ownerAddress,
    required String decision, // 'approved' or 'denied'
    String reason = '',
  }) async {
    final url = Uri.parse('$_baseUrl/decision');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'requestId': requestId,
        'ownerAddress': ownerAddress,
        'decision': decision,
        'reason': reason,
      }),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    } else {
      return null;
    }
  }
}
