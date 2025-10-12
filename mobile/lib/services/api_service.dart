import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class ApiService {
  static const _storage = FlutterSecureStorage();

  static Future<String?> _getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  static Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('$backendUrl$endpoint');
    final token = await _getToken();
    final headers = <String, String>{};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return await http.get(url, headers: headers);
  }

  static Future<http.Response> post(
    String endpoint, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    final url = Uri.parse('$backendUrl$endpoint');
    final token = await _getToken();
    final allHeaders = <String, String>{};
    if (headers != null) {
      allHeaders.addAll(headers);
    }
    if (token != null) {
      allHeaders['Authorization'] = 'Bearer $token';
    }
    return await http.post(url, headers: allHeaders, body: body);
  }

  static Future<Map<String, dynamic>> getDashboardData() async {
    final response = await get('/dashboard');
    if (response.statusCode == 200) {
      return Map<String, dynamic>.from(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load dashboard data');
    }
  }
}
