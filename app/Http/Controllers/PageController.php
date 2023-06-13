<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Page;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function pageContent($slug)
    {
        $page = Page::where('slug', $slug)->first();

        // Check page status
        if ( ! $page->status ) {
            abort(404);
        }

        if ($page) {
            return view('page.index', compact('page'));
        } else {
            abort(404);
        }
    }
   
    public function pageList()
    {
        $list = Page::orderBy('id', 'asc')->get();
        return view('panel.page.list', compact('list'));
    }

    public function pageAddOrUpdate($id = null){
        if ($id == null){
            $page = null;
        }else{
            $page = Page::where('id', $id)->firstOrFail();
        }

        return view('panel.page.form', compact('page'));
    }

    public function pageDelete($id = null){
        $page = Page::where('id', $id)->firstOrFail();
        $page->delete();
        return back()->with(['message' => 'Deleted Succesfullt', 'type' => 'success']);
    }

    public function pageAddOrUpdateSave(Request $request){

        if ($request->page_id != 'undefined'){
            $page = Page::where('id', $request->page_id)->firstOrFail();
        }else{
            $page = new Page();
        }

        $page->title = $request->title;
        $page->slug = Str::slug($request->slug);
        $page->content = $request->content;
        $page->status = $request->status;
        $page->save();
    }

}
