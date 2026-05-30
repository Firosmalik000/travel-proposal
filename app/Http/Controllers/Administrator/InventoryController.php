<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreInventoryItemRequest;
use App\Http\Requests\Administrator\UpdateInventoryItemRequest;
use App\Models\InventoryItem;
use App\Models\TravelProduct;
use App\Services\InventoryStockService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(private readonly InventoryStockService $inventoryStockService) {}

    public function index(Request $request): Response
    {
        $search = trim($request->string('search')->value());
        $status = (string) $request->string('status')->value();
        $productType = (string) $request->string('product_type')->value();

        $inventoryItems = InventoryItem::query()
            ->with([
                'product:id,code,name,product_type,content',
                'creator:id,name',
                'updater:id,name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner
                        ->where('notes', 'like', '%'.$search.'%')
                        ->orWhereHas('product', function ($productQuery) use ($search): void {
                            $productQuery
                                ->where('code', 'like', '%'.$search.'%')
                                ->orWhere('name', 'like', '%'.$search.'%')
                                ->orWhere('product_type', 'like', '%'.$search.'%');
                        });
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), function ($query) use ($status): void {
                $query->where('is_active', $status === 'active');
            })
            ->when($productType !== '' && $productType !== 'all', function ($query) use ($productType): void {
                $query->whereHas('product', function ($productQuery) use ($productType): void {
                    $productQuery->where('product_type', $productType);
                });
            })
            ->orderBy('product_id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (InventoryItem $item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_code' => (string) ($item->product?->code ?? ''),
                'product_name' => (string) ($item->product?->name ?? ''),
                'product_type' => (string) ($item->product?->product_type ?? ''),
                'unit' => is_array($item->product?->content)
                    ? (string) ($item->product->content['unit'] ?? '')
                    : '',
                'quantity' => $item->quantity,
                'notes' => $item->notes,
                'is_active' => $item->is_active,
                'created_at' => $item->created_at?->toDateTimeString(),
                'updated_at' => $item->updated_at?->toDateTimeString(),
                'created_by_name' => $item->creator?->name,
                'updated_by_name' => $item->updater?->name,
            ]);

        return Inertia::render('Dashboard/MasterData/Inventory/Index', [
            'inventoryItems' => $inventoryItems,
            'filters' => [
                'search' => $search,
                'status' => $status !== '' ? $status : 'all',
                'product_type' => $productType !== '' ? $productType : 'all',
            ],
            'stats' => [
                'total' => InventoryItem::query()->count(),
                'active' => InventoryItem::query()->where('is_active', true)->count(),
                'inactive' => InventoryItem::query()->where('is_active', false)->count(),
            ],
            'productOptions' => TravelProduct::query()
                ->where('is_active', true)
                ->where(function ($query): void {
                    $query
                        ->whereNull('product_type')
                        ->orWhereRaw('LOWER(product_type) <> ?', ['hotel']);
                })
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'product_type'])
                ->map(fn (TravelProduct $product): array => [
                    'id' => $product->id,
                    'code' => (string) $product->code,
                    'name' => (string) $product->name,
                    'product_type' => (string) $product->product_type,
                ])
                ->values()
                ->all(),
            'productTypeOptions' => TravelProduct::query()
                ->where('is_active', true)
                ->whereNotNull('product_type')
                ->distinct()
                ->orderBy('product_type')
                ->pluck('product_type')
                ->map(fn (string $type): array => [
                    'value' => $type,
                    'label' => ucfirst($type),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $product = TravelProduct::query()->findOrFail($request->integer('product_id'));

            $inventoryItem = InventoryItem::query()->create([
                'item_code' => (string) $product->code,
                'item_name' => (string) $product->name,
                'category' => (string) $product->product_type,
                'unit' => is_array($product->content) ? (string) ($product->content['unit'] ?? '') : null,
                'product_id' => $request->integer('product_id'),
                'quantity' => 0,
                'notes' => $request->filled('notes') ? trim((string) $request->string('notes')->value()) : null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $this->inventoryStockService->applyManualAdjustment(
                $inventoryItem,
                $request->integer('quantity'),
                'Stok awal inventory.',
            );
        });

        return back()->with('success', 'Data inventory berhasil ditambahkan.');
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $inventoryItem): void {
                $product = TravelProduct::query()->findOrFail($request->integer('product_id'));

                $inventoryItem->update([
                    'item_code' => (string) $product->code,
                    'item_name' => (string) $product->name,
                    'category' => (string) $product->product_type,
                    'unit' => is_array($product->content) ? (string) ($product->content['unit'] ?? '') : null,
                    'product_id' => $request->integer('product_id'),
                    'notes' => $request->filled('notes') ? trim((string) $request->string('notes')->value()) : null,
                    'is_active' => $request->boolean('is_active', true),
                ]);

                $this->inventoryStockService->applyManualAdjustment(
                    $inventoryItem,
                    $request->integer('stock_adjustment'),
                    'Penyesuaian stok dari admin inventory.',
                );
            });
        } catch (DomainException $exception) {
            return back()->withErrors([
                'stock_adjustment' => $exception->getMessage(),
            ]);
        }

        return back()->with('success', 'Data inventory berhasil diperbarui.');
    }

    public function destroy(InventoryItem $inventoryItem): RedirectResponse
    {
        $inventoryItem->delete();

        return back()->with('success', 'Data inventory berhasil dihapus.');
    }
}
