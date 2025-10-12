import 'package:js/js.dart';
import 'package:js/js_util.dart';

@JS('globalThis')
external dynamic globalThis;

class MetaMaskService {
  static Future<String?> connect() async {
    try {
      final connectFn = getProperty(globalThis, 'connectMetaMask');
      if (connectFn != null) {
        final account = await promiseToFuture(
          callMethod(connectFn, 'call', [globalThis]),
        );
        if (account != null) return account as String?;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  static bool isAvailable() {
    final isAvailableFn = getProperty(globalThis, 'isMetaMaskAvailable');
    if (isAvailableFn != null) {
      final result = callMethod(isAvailableFn, 'call', [globalThis]);
      if (result != null) return result as bool;
    }
    return false;
  }
}
