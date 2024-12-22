<?php

namespace App\Http\Controllers;
use App\Models\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function index()
    {
        // Fetch and return all admins
        $admins = Admin::all();
        return response()->json($admins);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'Name' => 'required|string',
                'UMEmail' => 'required|string|email|unique:Admin,UMEmail',
                'Status' => 'required|string',
                'Remarks' => 'nullable|string',
                'role' => 'required|string',
            ]);

            $validatedData['Password'] = Hash::make('password123');
    
            Admin::create($validatedData);
    
            return response()->json(['message' => 'Admin added successfully']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            log::error($e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            log::error($e->getMessage());   
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $AdminID)
    {
        $admin = Admin::find($AdminID);

        if (!$admin) {
            return response()->json(['message' => 'Admin not found'], 404);
        }

        $validatedData = $request->validate([
            'Name' => 'required|string',
            'UMEmail' => 'required|string',
            'Status' => 'required|string',
            'Remarks' => 'nullable|string',
            'role' => 'required|string',
        ]);

        $admin->update($validatedData);

        return response()->json(['message' => 'Admin updated successfully']);
    }

    public function destroy($id)
    {
        $admin = Admin::find($id);

        if (!$admin) {
            return response()->json(['error' => 'Admin not found'], 404);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully']);
    }

}
