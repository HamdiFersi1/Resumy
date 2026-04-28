"use client";
import  { useEffect, PropsWithChildren } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../../lib/redux/store";
import { clearResume } from "../../lib/redux/resumeSlice";
import { ResumeForm } from "../../components/Builder/ResumeForm";
import { Resume } from "../../components/Builder/Resume";




function ResetResumeOnMount({ children }: PropsWithChildren) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(clearResume());
  }, [dispatch]);
  return <>{children}</>;
}


export default function ResumeBuilder() {
  return (
    <Provider store={store}>
      <ResetResumeOnMount>
        <main className="relative h-full w-full overflow-hidden bg-gray-50">
          <div className="grid grid-cols-3 md:grid-cols-6">
            <div className="col-span-3">
              <ResumeForm />
            </div>
            <div className="col-span-3">
              <Resume />
            </div>
          </div>
        </main>
      </ResetResumeOnMount>
    </Provider>
  );
}
