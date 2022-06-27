<script lang="ts">
import { TimelineGroup } from "$/plugins/api/app";

import Timeline from "$lib/App/Timeline.svelte";

</script>

<Timeline timelineId={{ group: TimelineGroup.AllPostsInGroup, id: TimelineGroup.Topics }}></Timeline>