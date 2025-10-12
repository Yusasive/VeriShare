import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:pointycastle/export.dart';
import 'dart:typed_data';
import 'dart:math';

class WalletService {
  static const _storage = FlutterSecureStorage();
  static const _privateKeyKey = 'private_key';
  static const _publicKeyKey = 'public_key';

  // Generate a new RSA keypair
  static Future<Map<String, String>> generateKeyPair() async {
    final keyParams = RSAKeyGeneratorParameters(
      BigInt.parse('65537'),
      2048,
      12,
    );
    final secureRandom = FortunaRandom();
    final random = Random.secure();
    final seeds = List<int>.generate(32, (_) => random.nextInt(256));
    secureRandom.seed(KeyParameter(Uint8List.fromList(seeds)));
    final generator =
        RSAKeyGenerator()..init(ParametersWithRandom(keyParams, secureRandom));
    final pair = generator.generateKeyPair();
    final privateKey = pair.privateKey;
    final publicKey = pair.publicKey;
    final privatePem = _encodePrivateKeyToPem(privateKey);
    final publicPem = _encodePublicKeyToPem(publicKey);
    await _storage.write(key: _privateKeyKey, value: privatePem);
    await _storage.write(key: _publicKeyKey, value: publicPem);
    return {'privateKey': privatePem, 'publicKey': publicPem};
  }

  static Future<String?> getPublicKey() async {
    return await _storage.read(key: _publicKeyKey);
  }

  static Future<String?> getPrivateKey() async {
    return await _storage.read(key: _privateKeyKey);
  }

  // Helper functions to encode keys to PEM format
  static String _encodePrivateKeyToPem(RSAPrivateKey privateKey) {
    // For demo: just base64 encode the key params (not a real PEM)
    final data = json.encode({
      'n': privateKey.n.toString(),
      'd': privateKey.privateExponent.toString(),
      'p': privateKey.p.toString(),
      'q': privateKey.q.toString(),
    });
    return base64.encode(utf8.encode(data));
  }

  static String _encodePublicKeyToPem(RSAPublicKey publicKey) {
    final data = json.encode({
      'n': publicKey.n.toString(),
      'e': publicKey.exponent.toString(),
    });
    return base64.encode(utf8.encode(data));
  }
}
