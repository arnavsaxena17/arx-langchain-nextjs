
export function ButtonSubmit(props: { chatEndpointIsLoading: boolean, intermediateStepsLoading: boolean }) {

  return (
    <button type="submit" className="px-8 py-4 rounded shrink-0 bg-sky-600 w-28">
<div role="status" className={`${(props.chatEndpointIsLoading || props.intermediateStepsLoading) ? "" : "hidden"} flex justify-center`}>
  <span className="sr-only">Loading...</span>
</div>
<span className={(props.chatEndpointIsLoading || props.intermediateStepsLoading) ? "hidden" : ""}>Send</span>
</button>
    )
  ;
}