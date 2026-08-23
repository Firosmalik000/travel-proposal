<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StorePackageDraftImagesRequest;
use App\Http\Requests\Administrator\StorePackageDraftRequest;
use App\Models\PackageDraft;
use App\Models\TravelPackage;
use App\Services\PackageDraftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageDraftController extends Controller
{
    public function __construct(private readonly PackageDraftService $draftService) {}

    public function upsertCreate(StorePackageDraftRequest $request): JsonResponse
    {
        return $this->draftResponse(
            $this->draftService->upsert($request->user(), $request->input('payload', [])),
        );
    }

    public function upsertEdit(StorePackageDraftRequest $request, TravelPackage $package): JsonResponse
    {
        return $this->draftResponse(
            $this->draftService->upsert($request->user(), $request->input('payload', []), $package),
        );
    }

    public function uploadCreateImages(StorePackageDraftImagesRequest $request): JsonResponse
    {
        $this->draftService->uploadImages($request->user(), $request->file('images', []));

        return $this->currentDraftResponse($request);
    }

    public function uploadEditImages(
        StorePackageDraftImagesRequest $request,
        TravelPackage $package,
    ): JsonResponse {
        $this->draftService->uploadImages($request->user(), $request->file('images', []), $package);

        return $this->currentDraftResponse($request, $package);
    }

    public function deleteCreateImage(Request $request, string $imageId): JsonResponse
    {
        return $this->draftResponse(
            $this->draftService->deleteImage($request->user(), $imageId),
        );
    }

    public function deleteEditImage(
        Request $request,
        TravelPackage $package,
        string $imageId,
    ): JsonResponse {
        return $this->draftResponse(
            $this->draftService->deleteImage($request->user(), $imageId, $package),
        );
    }

    public function destroyCreate(Request $request): JsonResponse
    {
        $this->draftService->discard($request->user());

        return response()->json(['message' => 'Draft package baru berhasil dibuang.']);
    }

    public function destroyEdit(Request $request, TravelPackage $package): JsonResponse
    {
        $this->draftService->discard($request->user(), $package);

        return response()->json(['message' => 'Draft perubahan package berhasil dibuang.']);
    }

    private function currentDraftResponse(Request $request, ?TravelPackage $package = null): JsonResponse
    {
        $draft = $this->draftService->findForUser($request->user(), $package);
        abort_if($draft === null, 404);

        return $this->draftResponse($draft);
    }

    private function draftResponse(PackageDraft $draft): JsonResponse
    {
        return response()->json([
            'message' => 'Draft berhasil disimpan.',
            'draft' => $this->draftService->serialize($draft),
        ]);
    }
}
