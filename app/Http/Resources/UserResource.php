<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'username'    => $this->username,
            'phone'       => $this->phone,
            'state'       => $this->state,
            'district'    => $this->district,
            'address'     => $this->address,
            'dealer_name' => $this->dealer_name,
            'is_approved' => $this->is_approved,
            'dealer_id'   => $this->dealer_id,
            'dealer'      => new UserResource($this->whenLoaded('dealer')),
            'role'        => new RoleResource($this->whenLoaded('role')),
            'created_at'  => optional($this->created_at)->toISOString(),
        ];
    }
}
