import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class ActivityLogService {
  static Future<List<String>> getLog() async {
    final url = Uri.parse('$backendUrl/api/activity-log');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data is List) {
        return data.map((e) => e.toString()).toList();
      }
    }
    return [];
  }

  static Future<void> addLog(String entry) async {
    final url = Uri.parse('$backendUrl/api/activity-log');
    await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'entry': entry}),
    );
  }

  static Future<void> clearLog() async {
    final url = Uri.parse('$backendUrl/api/activity-log/clear');
    await http.post(url);
  }
}
