import 'package:flutter/material.dart';

class AddEditCredentialScreen extends StatelessWidget {
  const AddEditCredentialScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add/Edit Credential'),
        backgroundColor: Colors.purpleAccent,
      ),
      body: Center(
        child: Text(
          'Add/Edit Credential Screen',
          style: TextStyle(fontSize: 22, color: Colors.white),
        ),
      ),
      backgroundColor: Colors.black,
    );
  }
}
